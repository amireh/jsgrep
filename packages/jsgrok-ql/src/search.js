const L_ANY = 'L_ANY';
const L_VOID = 'L_VOID';
const L_THIS = 'L_THIS';
const MAX_LINE_LEN = 80;

const t = {
  identifier: x => x && x.type === 'Identifier',
  memberExpression: x => x && x.type === 'MemberExpression',
}

const p = {
  identifierMatches: id => node => {
    if (t.identifier(node)) {
      return id === node.name;
    }
  },

  receiverMatches: receiver => node => {
    if (receiver === L_ANY) {
      return true;
    }
    else if (t.memberExpression(node) && t.identifier(node.object)) {
      return receiver === node.object.name;
    }
  },
}

const cram = line => line.substr(0, MAX_LINE_LEN - 3);

const createVisitors = (state, query) => {
  const visitors = {};
  const track = node => {
    const line = state.sourceLines[node.loc.start.line - 1];
    const startLine = node.loc.start.line;
    const startColumn = node.loc.start.column;
    const endColumn = node.loc.end.line !== node.loc.start.line ?
      line.length :
      node.loc.end.column
    ;

    if (line.length > MAX_LINE_LEN) {
      const token = cram(line.substring(startColumn, endColumn));
      const leadingChars = startColumn;
      const trailingChars = line.length - endColumn;
      const leadingString = leadingChars > 0 ?
        `+${leadingChars} ... ` :
        ``
      ;

      const trailingString = trailingChars > 0 ?
        ` ... +${trailingChars}` :
        ``
      ;

      state.results.push({
        match: `${leadingString}${token}${trailingString}`,
        line: startLine,
        start: leadingString.length,
        end: leadingString.length + token.length,
      })
    }
    else {
      state.results.push({
        match: line,
        line: startLine,
        start: startColumn,
        end: endColumn
      })
    }
  }

  query.expressions.some(([ expr, args ]) => {
    if (expr === 'function-call') {
      visitors.CallExpression = function(node) {
        if (args.receiver && t.memberExpression(node.callee)) {
          if (!p.identifierMatches(args.id)(node.callee.property)) {
            return;
          }

          if (p.receiverMatches(args.receiver)(node.callee)) {
            track(node.callee.property);
          }
        }
        // static function call
        else if (!args.receiver && t.identifier(node.callee)) {
          if (p.identifierMatches(args.id)(node.callee)) {
            track(node.callee)
          }
        }
      }
    }
  })

  return visitors;
}

/**
 * @return {Array.<SearchResult>}
 *
 * @typedef {SearchResult}
 *
 * @property {String} match
 * @property {Number} line
 * @property {Number} start
 * @property {Number} end
 */
module.exports = function search(walk, query, ast, sourceCode) {
  const state = { sourceLines: sourceCode.split('\n'), results: [] };
  const visitors = createVisitors(state, query);

  walk(ast, visitors);

  return state.results;
};
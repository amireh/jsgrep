const MAX_LINE_LEN = 80;
const { pipe } = require('../functional');

const queryEvaluators = [
  require('./function-call')
]

const cram = line => line.substr(0, MAX_LINE_LEN - 3);

const track = (state, node) => {
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

const createVisitors = (state, query) => {
  const trackForThis = track.bind(null, state);
  const trackReturnedNodes = nodes => {
    nodes.forEach(trackForThis);
  }

  const evaluators = queryEvaluators.map(x => x.evaluate)
  const visitors = query.expressions.slice(0, 1).reduce((map, expr) => {
    evaluators.forEach(evaluator => {
      evaluator(expr).forEach(([ nodeType, f ]) => {
        // todo: compose them i guess
        map[nodeType] = pipe(f, trackReturnedNodes);
      })
    })

    return map
  }, {})

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
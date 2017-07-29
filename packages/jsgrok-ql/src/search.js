const t = {
  identifier: x => x && x.type === 'Identifier'
}

const createVisitors = (state, query) => {
  const visitors = {};
  const track = node => {
    state.results.push({
      match: '...', // TODO: consider printing using the "offset" loc param
      line: node.loc.start.line,
      start: node.loc.start.column,
      end: 0
    })
  }

  query.expressions.some(expr => {
    if (expr[0] === 'function-call') {
      visitors.CallExpression = function(node) {
        if (expr[1].id && t.identifier(node.callee) && node.callee.name === expr[1].id) {
          track(node.callee)
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
module.exports = function search(walk, query, ast) {
  const state = { results: [] };
  const visitors = createVisitors(state, query);

  walk(ast, visitors);

  return state.results;
};
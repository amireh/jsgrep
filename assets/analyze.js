const state = { results: null }
const analyzers = [
  require('analyzers/call.js'),
  require('analyzers/objectProperty.js'),
];

const visitors = analyzers.reduce(function(map, analyzer) {
  return Object.assign(map, analyzer(state))
}, {});

module.exports = function analyze(walk, ast) {
  state.results = [];

  walk.simple(ast, visitors)

  return state.results;
};

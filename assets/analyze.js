const walk = require('walk.js');
const analyzers = [
  require('analyzers/call.js'),
  require('analyzers/objectProperty.js'),
];

module.exports = function analyze(ast) {
  const state = { results: [] }

  walk.simple(ast, analyzers.reduce(function(map, analyzer) {
    return Object.assign(map, analyzer(state))
  }, {}))

  return state.results;
};

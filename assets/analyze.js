(function(exports) {
  const analyzers = [
    require('analyzers/call.js').default,
    require('analyzers/objectProperty.js').default,
  ];

  exports.default = function analyze(ast) {
    const state = { results: [] }

    acorn.walk.simple(ast, analyzers.reduce(function(map, analyzer) {
      return Object.assign(map, analyzer(state))
    }, {}))

    return state.results;
  };

  return exports;
}({}))
(function(exports) {
  const analyzers = [
    require('src/analyzers/call.js').default,
    require('src/analyzers/objectProperty.js').default,
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
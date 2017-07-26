(function(exports) {
  exports.default = function analyze(analyzers, ast) {
    const state = {
      results: []
    }

    acorn.walk.simple(ast, analyzers.reduce(function(map, analyzer) {
      return Object.assign(map, analyzer(state))
    }))

    return state;
  };

  return exports;
}({}))
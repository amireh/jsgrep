(function(exports) {
  exports.default = function call(state) {
    return {
      VariableDeclaration(node) {
        state.results.push(
          node.declarations[0].id.name,
          node.declarations[0].init.value
        )
      }
    };
  };

  return exports;
}({}))
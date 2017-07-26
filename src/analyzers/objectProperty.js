(function(exports) {
  exports.default = function objectProperty(state) {
    return {
      ObjectExpression(node) {
        node.properties.forEach(prop => {
          state.results.push(prop.key.name);
          state.results.push(prop.value.type);
        })
      }
    }
  };

  return exports;
}({}))
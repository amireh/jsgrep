module.exports = function(state) {
  return {
    ObjectExpression(node) {
      // node.properties.forEach(prop => {
      //   state.results.push(prop.key.name);
      //   state.results.push(prop.value.type);
      // })
    }
  }
};
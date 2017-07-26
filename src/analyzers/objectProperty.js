(function(exports) {
  exports.default = function objectProperty(ast) {
    return [ ast.body[1].declarations[0].id.name ];
  };

  return exports;
}({}))
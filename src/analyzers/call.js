(function(exports) {
  exports.default = function call(ast) {
    return ast.body[0].declarations[0].id.name;
  };

  return exports;
}({}))
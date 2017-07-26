(function(exports) {
  exports.default = function objectProperty(ast) {
    return [
      ast.body[1].declarations[0].id.name,
      ast.body[1].declarations[0].init.value,
    ];
  };

  return exports;
}({}))
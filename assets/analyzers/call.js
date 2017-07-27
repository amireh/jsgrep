(function(exports) {
  exports.default = function call(state) {
    return {
      VariableDeclaration(node) {
        const decl = node.declarations[0];

        state.results.push({
          match: decl.id.name,
          line: node.loc.start.line,
          start: node.loc.start.column,
          end: node.loc.end.column,
        });

        // if (node.declarations[0].init.type === 'Literal') {
        //   state.results.push(
        //     node.declarations[0].init.value
        //   )
        // }
      }
    };
  };

  return exports;
}({}))
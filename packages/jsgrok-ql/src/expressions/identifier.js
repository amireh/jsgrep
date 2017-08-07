const { t, qt } = require('../utils')

exports.evaluate = expr => {
  if (qt.identifier(expr)) {
    return [
      ['MemberExpression', (node, ancestry) => {
        const parent = ancestry[ancestry.length-2]

        // for more context about this, see https://github.com/ternjs/acorn/issues/46
        if (!t.callExpression(parent) && t.identifierOf(expr.name, node.property)) {
          return [ node ];
        }
        else {
          return [];
        }
      }],

      ['Identifier', node => node.name === expr.name ? [node] : []]
    ]
  }
}
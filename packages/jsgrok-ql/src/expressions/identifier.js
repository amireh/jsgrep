const { t } = require('../utils')

exports.evaluate = expr => {
  if (expr[0] === 'identifier') {
    return [
      ['MemberExpression', (node, ancestry) => {
        const parent = ancestry[ancestry.length-2]

        // for more context about this, see https://github.com/ternjs/acorn/issues/46
        if (!t.callExpression(parent) && t.identifierOf(expr[1], node.property)) {
          return [ node ];
        }
        else {
          return [];
        }
      }],

      ['Identifier', node => node.name === expr[1] ? [node] : []]
    ]
  }
}
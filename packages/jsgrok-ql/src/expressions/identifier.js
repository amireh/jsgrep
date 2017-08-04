const { t } = require('../utils')
const {
  L_ANY,
  L_THIS,
} = require('../constants');

exports.evaluate = () => expr => {
  if (expr[0] === 'identifier' && expr[1] === L_THIS) {
    return [
      ['ThisExpression', node => ([node]) ]
    ]
  }
  else if (expr[0] === 'identifier' && expr[1] === L_ANY) {
    return [
      ['ThisExpression', node => ([node]) ],
      ['MemberExpression', node => {
        if (t.identifier(node.object)) {
          return [ node.object ];
        }
        else {
          return [];
        }
      }],
    ]
  }
  else if (expr[0] === 'identifier') {
    return [
      ['MemberExpression', (node, ancestry) => {
        const parent = ancestry[ancestry.length-2]

        if (t.callExpression(parent)) {
          return [];
        }
        else if (t.identifierOf(expr[1], node.property)) {
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
const { t } = require('../utils')
const {
  L_ANY,
  L_ANY_GREEDY,
  L_THIS,
} = require('../constants');

const memberExpressionHasAnyIdentifierForAnObject = node => {
  if (t.identifier(node.object) || t.ThisExpression(node.object)) {
    return true;
  }
  else if (t.memberExpression(node.object)) {
    return memberExpressionHasAnyIdentifierForAnObject(node.object)
  }
  else {
    return false;
  }
}

exports.evaluate = () => expr => {
  // if (expr[0] === 'identifier' && expr[1] === L_THIS) {
  //   return [
  //     // ['ThisExpression', node => ([node]) ]
  //   ]
  // }
  // else if (expr[0] === 'identifier' && expr[1] === L_ANY) {
  //   return [
  //     // ['ThisExpression', node => ([node]) ],
  //     // ['Identifier', node => ([node]) ],
  //     // ['CallExpression', node => {
  //     //   if (t.memberExpression(node.callee) && t.identifier(node.callee.object)) {
  //     //     return [ node.callee.object ]
  //     //   }
  //     //   else {
  //     //     return []
  //     //   }
  //     // }],
  //   ]
  // }
  // else if (expr[0] === 'identifier' && expr[1] === L_ANY_GREEDY) {
  //   return [
  //     // ['ThisExpression', node => ([node]) ],
  //     // ['Identifier', node => ([node]) ],
  //     // ['CallExpression', node => {
  //     //   if (memberExpressionHasAnyIdentifierForAnObject(node.callee)) {
  //     //     return [ node.callee.object ]
  //     //   }
  //     //   else {
  //     //     return [];
  //     //   }
  //     // }],
  //   ]
  // }
  // else
    if (expr[0] === 'identifier') {
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
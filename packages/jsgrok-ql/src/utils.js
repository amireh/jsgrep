const { L_ANY } = require('./constants')
const t = {
  identifier: x => !!(x && x.type === 'Identifier'),
  identifierOf: (name, x) => t.identifier(x) && (
    name === L_ANY ||
    name === x.name
  ),
  literal: x => !!(x && x.type === 'Literal'),
  callExpression: x => !!(x && x.type === 'CallExpression'),
  memberExpression: x => !!(x && x.type === 'MemberExpression'),
  newExpression: x => !!(x && x.type === 'NewExpression'),
  objectExpression: x => !!(x && x.type === 'ObjectExpression'),
  thisExpression: x => !!(x && x.type === 'ThisExpression'),
  unaryExpression: x => !!(x && x.type === 'UnaryExpression'),
}

exports.t = t
const { L_ANY } = require('./constants')
const t = {
  identifier: x => !!(x && x.type === 'Identifier'),
  identifierOf: (name, x) => t.identifier(x) && (
    name === L_ANY ||
    name === x.name
  ),
  importDefaultSpecifier: x => !!(x && x.type === 'ImportDefaultSpecifier'),
  importSpecifierOf: name => node => !!(node && node.type === 'ImportSpecifier') && (
    t.identifier(node.imported) &&
    node.imported.name === name
  ),
  literal: x => !!(x && x.type === 'Literal'),
  literalOf: (name, x) => t.literal(x) && (
    x.value === name
  ),
  callExpression: x => !!(x && x.type === 'CallExpression'),
  memberExpression: x => !!(x && x.type === 'MemberExpression'),
  newExpression: x => !!(x && x.type === 'NewExpression'),
  objectExpression: x => !!(x && x.type === 'ObjectExpression'),
  thisExpression: x => !!(x && x.type === 'ThisExpression'),
  unaryExpression: x => !!(x && x.type === 'UnaryExpression'),
}

exports.t = t
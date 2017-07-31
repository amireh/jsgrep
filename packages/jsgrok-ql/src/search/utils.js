exports.t = {
  identifier: x => !!(x && x.type === 'Identifier'),
  literal: x => !!(x && x.type === 'Literal'),
  callExpression: x => !!(x && x.type === 'CallExpression'),
  memberExpression: x => !!(x && x.type === 'MemberExpression'),
  newExpression: x => !!(x && x.type === 'NewExpression'),
  objectExpression: x => !!(x && x.type === 'ObjectExpression'),
  thisExpression: x => !!(x && x.type === 'ThisExpression'),
  unaryExpression: x => !!(x && x.type === 'UnaryExpression'),
}
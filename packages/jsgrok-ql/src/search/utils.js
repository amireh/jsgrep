exports.t = {
  identifier: x => !!(x && x.type === 'Identifier'),
  literal: x => !!(x && x.type === 'Literal'),
  memberExpression: x => !!(x && x.type === 'MemberExpression'),
  newExpression: x => !!(x && x.type === 'NewExpression'),
  thisExpression: x => !!(x && x.type === 'ThisExpression'),
  callExpression: x => !!(x && x.type === 'CallExpression'),
  unaryExpression: x => !!(x && x.type === 'UnaryExpression'),
}
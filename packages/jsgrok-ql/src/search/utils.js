exports.t = {
  identifier: x => x && x.type === 'Identifier',
  memberExpression: x => x && x.type === 'MemberExpression',
  thisExpression: x => x && x.type === 'ThisExpression',
  callExpression: x => x && x.type === 'CallExpression',
}
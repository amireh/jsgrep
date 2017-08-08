const { t } = require('../utils')
const is = x => y => y === x;

exports['FunctionCall . FunctionCall'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node.callee) &&
  lhs.some(is(node.callee.object))
)

exports['This . FunctionCall'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node.callee) &&
  t.thisExpression(node.callee.object)
)

exports['* . FunctionCall'] = (state, lhs, rhs) => rhs.filter(node => {
  return t.memberExpression(node.callee) && (
    t.identifier(node.callee.object) ||
    t.thisExpression(node.callee.object)
  )
})

exports['** . FunctionCall'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node.callee)
)

exports['Identifier . FunctionCall'] = (state, lhs, rhs) => rhs.filter(node => {
  return (
    t.memberExpression(node.callee) &&
    lhs.some(is(node.callee.object))
  )
})

exports['FunctionCall . Identifier'] = (state, _, rhs) => rhs

exports['T . FunctionCall'] = (state, _, rhs) => rhs.filter(node =>
  !t.memberExpression(node.callee)
)

exports['T . Identifier'] = (state, _, rhs) => rhs.filter(node => {
  return !t.memberExpression(node)
})

exports['* . Identifier'] = (state, _, rhs) => rhs.filter(node =>
  t.memberExpression(node) && (
    t.identifier(node.object) ||
    t.thisExpression(node.object)
  )
)

exports['This . Identifier'] = (state, _, rhs) => rhs.filter(node =>
  t.memberExpression(node) &&
  t.thisExpression(node.object)
)

exports['Identifier . Identifier'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node) &&
  lhs.some(is(node.object))
)

const { t } = require('../utils')
const is = x => y => y === x;

exports['function-call . function-call'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node.callee) &&
  lhs.some(is(node.callee.object))
)

exports['this . function-call'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node.callee) &&
  t.thisExpression(node.callee.object)
)

exports['* . function-call'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node.callee) && (
    t.identifier(node.callee.object) ||
    t.thisExpression(node.callee.object)
  )
)

exports['** . function-call'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node.callee)
)

exports['identifier . function-call'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node.callee) &&
  lhs.some(is(node.callee.object))
)

exports['function-call . identifier'] = (state, _, rhs) => rhs

exports['T . function-call'] = (state, _, rhs) => rhs.filter(node =>
  !t.memberExpression(node.callee)
)

exports['T . identifier'] = (state, _, rhs) => rhs.filter(node =>
  !t.memberExpression(node)
)

exports['* . identifier'] = (state, _, rhs) => rhs.filter(node =>
  t.memberExpression(node) && (
    t.identifier(node.object) ||
    t.thisExpression(node.object)
  )
)

exports['this . identifier'] = (state, _, rhs) => rhs.filter(node =>
  t.memberExpression(node) &&
  t.thisExpression(node.object)
)

exports['identifier . identifier'] = (state, lhs, rhs) => rhs.filter(node =>
  t.memberExpression(node) &&
  lhs.some(is(node.object))
)

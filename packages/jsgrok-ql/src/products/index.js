const { t } = require('../utils')

exports['function-call . function-call'] = (state, lhsNodes, rhsNodes) => {
  return rhsNodes.filter(node => {
    return t.memberExpression(node.callee) && lhsNodes.some(otherNode => {
      return node.callee.object === otherNode
    })
  })
}

exports['this . function-call'] = (state, lhs, rhs) => rhs.filter(node => {
  return t.memberExpression(node.callee) && t.thisExpression(node.callee.object)
})

exports['* . function-call'] = (state, lhs, rhs) => rhs.filter(node => {
  return t.memberExpression(node.callee) && (
    t.identifier(node.callee.object) ||
    t.thisExpression(node.callee.object)
  )
})

exports['** . function-call'] = (state, lhs, rhs) => rhs.filter(node => {
  return t.memberExpression(node.callee)
})

exports['identifier . function-call'] = (state, identifierNodes, rhsNodes) => {
  return rhsNodes.filter(node => {
    return t.memberExpression(node.callee) && identifierNodes.some(idNode => {
      return idNode === node.callee.object;
    })
  });
}

exports['function-call . identifier'] = (state, _, nodes) => {
  return nodes;
}

exports['T . function-call'] = (state, _, nodes) => {
  return nodes.filter(node => {
    return !t.memberExpression(node.callee)
  })
}

exports['T . identifier'] = (state, x, y) => {
  return y.filter(node => !t.memberExpression(node))
}

exports['* . identifier'] = (state, lhsNodes, rhsNodes) => rhsNodes.filter(node => (
  t.memberExpression(node) && (
    t.identifier(node.object) ||
    t.thisExpression(node.object)
  )
))

exports['this . identifier'] = (state, _, rhs) => rhs.filter(node => (
  t.memberExpression(node) && t.thisExpression(node.object)
))

exports['identifier . identifier'] = (state, lhsNodes, rhsNodes) => {
  return rhsNodes.filter(rhsNode => {
    return t.memberExpression(rhsNode) && lhsNodes.some(lhsNode => {
      return rhsNode.object === lhsNode
    })
  })
}


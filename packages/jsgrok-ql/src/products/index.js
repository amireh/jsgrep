const { t } = require('../utils')
const { L_ANY, L_THIS } = require('../constants')

exports['function-call . function-call'] = (state, lhsFunctionCall, rhsFunctionCall) => {
  const lhsNodes = state.evaluateOperation(state, lhsFunctionCall)
  const rhsNodes = state.evaluateOperation(state, rhsFunctionCall)

  return rhsNodes.filter(node => {
    return t.memberExpression(node.callee) && lhsNodes.some(otherNode => {
      return node.callee.object === otherNode
    })
  })
}

exports['identifier . function-call'] = (state, identifier, functionCall) => {
  const receiver = identifier.expr[1]
  const rhsNodes = state.evaluateOperation(state, functionCall)

  const collectMatchingReceiverCalls = node => {
    if (receiver === L_ANY) {
      return t.memberExpression(node.callee);
    }
    else if (receiver === L_THIS) {
      return t.thisExpression(node.callee.object);
    }
    else if (t.identifier(node.callee.object)) {
      return receiver === node.callee.object.name;
    }
    else {
      return false;
    }
  }

  return rhsNodes.filter(collectMatchingReceiverCalls)
}

exports['T . function-call'] = (state, identifier, functionCall) => {
  const rhsNodes = state.evaluateExpression(state, functionCall.expr)

  const collectMatchingReceiverCalls = node => {
    return !t.memberExpression(node.callee)
  }

  return rhsNodes.filter(collectMatchingReceiverCalls)
}

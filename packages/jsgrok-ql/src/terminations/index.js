const { t } = require('../utils')

exports['function-call'] = (state, nodes) => {
  return nodes.filter(node => {
    return !t.memberExpression(node.callee)
  })
}
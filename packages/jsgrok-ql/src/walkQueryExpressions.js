const invariant = require('invariant')
const expressionEvaluators = require('./expressions')
const {
  O_EVAL,
  O_PRODUCT,
  O_TERMINATE,
} = require('./constants')

const walkTerm = (expr, f) => {
  if (!expr) {
    return;
  }

  expressionEvaluators.forEach(evaluator => {
    if (evaluator.walk) {
      evaluator.walk(expr, f)
    }
  })

  f(expr)
}

const walkQueryExpressions = (query, f) => {
  switch (query.op) {
    case O_PRODUCT:
      walkQueryExpressions(query.rhs, f)
      walkQueryExpressions(query.lhs, f)
      break;

    case O_TERMINATE:
      walkQueryExpressions(query.expr, f)
      break;

    case O_EVAL:
      walkTerm(query.expr, f)
      break;
  }
}

const ContainerOf = defaultValue => {
  let value = defaultValue;

  return {
    get: () => value,
    set: nextValue => { value = nextValue }
  }
}

const transformQueryExpressions = (query, f) => {
  switch (query.op) {
    case O_PRODUCT:
      const nextRhs = transformQueryExpressions(query.rhs, f)
      const nextLhs = transformQueryExpressions(query.lhs, f)

      return Object.assign({}, query, {
        rhs: nextRhs,
        lhs: nextLhs,
      })

      break;

    case O_TERMINATE:
      return Object.assign({}, query, {
        expr: transformQueryExpressions(query.expr, f)
      })

      break;

    case O_EVAL:
      const nextExpr = ContainerOf(query.expr);

      f(query.expr, nextExpr.set)

      return Object.assign({}, query, {
        expr: nextExpr.get()
      })

      break;

    default:
      invariant(false, `Don't know how to visit expression "${query.op}"`)
  }
}

exports.walkQueryExpressions = walkQueryExpressions
exports.transformQueryExpressions = transformQueryExpressions
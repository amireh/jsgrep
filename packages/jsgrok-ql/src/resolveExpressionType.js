const {
  O_EVAL,
  O_PRODUCT,
  O_TERMINATE,
} = require('./constants')

const resolveExpressionType = expr => {
  const term = resolveOutputTerm(expr);
  return term ? term.type : null
}

const resolveOutputTerm = expr => {
  switch (expr.type) {
    case O_TERMINATE:
      return resolveOutputTerm(expr.expr);

    case O_EVAL:
      return expr.expr;

    case O_PRODUCT:
      return resolveOutputTerm(expr.rhs);

    default:
      return null;
  }
}

exports.resolveExpressionType = resolveExpressionType
exports.resolveOutputTerm = resolveOutputTerm

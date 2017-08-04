const {
  O_EVAL,
  O_PRODUCT,
} = require('./constants')

const resolveExpressionType = expr => {
  switch (expr.op) {
    case 'O_TERMINATE':
      return resolveExpressionType(expr.expr);

    case O_EVAL:
      return expr.expr[0];

    case O_PRODUCT:
      return resolveExpressionType(expr.rhs);

    default:
      return null;
  }
}

module.exports = resolveExpressionType
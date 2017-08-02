const {
  O_EVAL_POLYNOMIAL,
  O_EVAL_MONOMIAL,
  O_PRODUCT,
  P_T,
} = require('./constants')

const resolveExpressionType = instruction => {
  if (instruction === P_T) {
    return 'T'
  }

  switch (instruction.op) {
    case O_EVAL_MONOMIAL:
    case O_EVAL_POLYNOMIAL:
      return instruction.expr[0];

    case O_PRODUCT:
      return resolveExpressionType(instruction.rhs);

    default:
      return null;
  }
}

module.exports = resolveExpressionType
const {
  O_EVAL,
  O_EVAL_MONOMIAL,
  O_PRODUCT,
} = require('./constants')

const resolveExpressionType = instruction => {
  switch (instruction.op) {
    case O_PRODUCT:
      return resolveExpressionType(instruction.rhs);

    case O_EVAL:
    case O_EVAL_MONOMIAL:
      return instruction.expr[0];

    default:
      return null;
  }
}

module.exports = resolveExpressionType
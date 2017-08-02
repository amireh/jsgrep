const invariant = require('invariant')
const { pipe } = require('./functional');
const createMatchSerializer = require('./createMatchSerializer')
const expressionEvaluators = require('./expressions')
const resolveExpressionType = require('./resolveExpressionType')
const products = require('./products')
const terminations = require('./terminations')

const evaluateOperation = (state, expr) => {
  switch (expr.op) {
    case 'O_PRODUCT':
      return applyProduct(state, expr.lhs, expr.rhs)

    case 'O_EVAL':
      return evaluateExpression(state, expr.expr);

    case 'O_EVAL_MONOMIAL':

      return (
        terminations[resolveExpressionType(expr)]
        (
          state,
          evaluateExpression(state, expr.expr)
        )
      );

    case undefined:
      throw new Error(`Malform OP construct: ${JSON.stringify(expr)}`);

    default:
      throw new Error(`Unknown OP "${expr.op}"`)
  }
}

const evaluateExpression = (state, expr) => {
  const nodes = []
  const trackReturnedNodes = list => {
    list.forEach(x => nodes.push(x))
  }

  const visitors = expressionEvaluators.map(x => x.evaluate).reduce((map, evaluator) => {
    (evaluator(expr) || []).forEach(([ nodeType, f ]) => {
      map[nodeType] = pipe(f, trackReturnedNodes);
    })

    return map
  }, {})

  state.nodes.forEach(node => state.walk(node, visitors));

  return nodes;
}

const applyProduct = (state, lhsExpr, rhsExpr) => {
  // console.log('lhs query?', lhsExpr)
  // console.log('rhs query?', rhsExpr)
  // console.log('lhs type?', resolveTypeOf(lhsExpr))
  // console.log('rhs type?', resolveTypeOf(rhsExpr))

  const productType = `${resolveExpressionType(lhsExpr)} . ${resolveExpressionType(rhsExpr)}`
  const production = products[productType]

  invariant(typeof production === 'function',
    `Unsupported production: [${productType}]`
  )

  return production(state, lhsExpr, rhsExpr)
}

/**
 * @return {Array.<SearchResult>}
 *
 * @typedef {SearchResult}
 *
 * @property {String} match
 * @property {Number} line
 * @property {Number} start
 * @property {Number} end
 */
module.exports = function search(walk, query, ast, sourceCode) {
  const serializeMatch = createMatchSerializer({ sourceCode })
  const matchingNodes = evaluateOperation({
    nodes: [ ast ],
    // we need to expose this to expression evaluators
    walk,
    // we need to expose those to products and terminations
    evaluateOperation,
    evaluateExpression
  }, query[0]);

  return matchingNodes.map(serializeMatch)
};
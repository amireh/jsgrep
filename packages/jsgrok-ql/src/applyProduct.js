const products = require('./products')
const resolveExpressionType = require('./resolveExpressionType')
const invariant = require('invariant')

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

module.exports = applyProduct;
const invariant = require('invariant')
const { identity, maybe, partial, pipe, trace } = require('./functional');
const createMatchSerializer = require('./createMatchSerializer')
const expressionEvaluators = require('./expressions')
const {
  resolveExpressionType,
  resolveOutputTerm
} = require('./resolveExpressionType')
const products = require('./products')
const {
  L_ANY,
  L_ANY_GREEDY,
  L_THIS,

  O_EVAL,
  O_PRODUCT,
  O_TERMINATE,
} = require('./constants')

const toArray = x => Array.isArray(x) ? x : [].concat(x || [])
const setNodes = (state, nodes) => Object.assign({}, state, { nodes })

const resolveProductExpression = (lhsExpr, rhsExpr) => {
  const lhs = resolveOutputTerm(lhsExpr);
  const rhs = resolveOutputTerm(rhsExpr)
  const candidates = [ `${lhs[0]} . ${rhs[0]}` ]

  if (lhs[0] === 'identifier') {
    switch (lhs[1]) {
      case L_ANY:
        candidates.unshift(`* . ${rhs[0]}`)
        break;

      case L_ANY_GREEDY:
        candidates.unshift(`** . ${rhs[0]}`)
        break;

      case L_THIS:
        candidates.unshift(`this . ${rhs[0]}`)
        break;
    }
  }

  return candidates.reduce(function(product, production) {
    if (product) {
      return product
    }
    else if (typeof products[production] === 'function') {
      return production;
    }
    else {
      return null
    }
  }, null)
}

const createEvaluationPipeline = (expr, list = []) => {
  switch (expr.op) {
    case O_EVAL:
      return list.concat(expr)

    case O_PRODUCT:
      return list.concat({
        op: O_PRODUCT,
        evaluateRHS: partial(evaluatePipeline, createEvaluationPipeline(expr.rhs)),
        evaluateLHS: partial(evaluatePipeline, createEvaluationPipeline(expr.lhs)),
        production: resolveProductExpression(expr.lhs, expr.rhs),
      });

    case O_TERMINATE:
      return list.concat({
        op: O_TERMINATE,
        evaluate: partial(evaluatePipeline, createEvaluationPipeline(expr.expr)),
        production: `T . ${resolveExpressionType(expr.expr)}`
      });

    default:
      invariant(false, `Don't know how to operate ${JSON.stringify(expr)}`)
  }
}

const evaluatePipeline = (operationPipe, initialState) => {
  return operationPipe.reduce(function(scope, expr) {
    if (initialState.debug) {
      trace(
        true,
        `${castExpressionToString(expr)} :: ${scope.length} nodes`
      )
      (
        scope.map(x => x.type)
      );
    }

    return evaluateOperation(setNodes(initialState, scope), expr);
  }, initialState.nodes)
}

const evaluateOperation = (state, expr) => {
  switch (expr.op) {
    case O_EVAL:
      return evaluateExpression(state, expr.expr);

    case O_PRODUCT:
      const rhsScope = expr.evaluateRHS(state);
      const lhsScope = expr.evaluateLHS(setNodes(state, rhsScope));

      invariant(typeof products[expr.production] === 'function',
        `Unsupported production: [${expr.production}]`
      )

      return products[expr.production](state, lhsScope, rhsScope)

    case O_TERMINATE:
      invariant(typeof products[expr.production] === 'function',
        `Unsupported production: [${expr.production}]`
      )

      return products[expr.production](state, null, expr.evaluate(state));

    case undefined:
      throw new Error(`Malform OP construct. Dump=${JSON.stringify(expr)}`);

    default:
      throw new Error(`Unknown OP "${expr.op}"`)
  }
}

const evaluateExpression = ({ walk, nodes }, expr) => {
  const nextNodes = []
  const trackReturnedNodes = list => {
    invariant(Array.isArray(list), `Expression evaluator must return an Array of nodes!`)

    list.forEach(x => nextNodes.push(x))
  }

  const visitors = expressionEvaluators
    .map(x => x.evaluate(nodes))
    .reduce((map, evaluator) => {
      toArray(evaluator(expr)).forEach(([ nodeType, f ]) => {
        // TODO: compose visitors
        invariant(!map[nodeType], `Don't know how to compose visitors yet! Node: ${nodeType}`)

        map[nodeType] = pipe(f, trackReturnedNodes);
      })

      return map
    }, {})
  ;

  nodes.forEach(node => walk(node, visitors));

  return nextNodes;
}

const castExpressionToString = expr => {
  switch (expr.op) {
    case O_PRODUCT:
      return `O_PRODUCT.<${expr.production}>`

    case O_EVAL:
      return `O_EVAL.<${expr.expr[0]}>`

    case O_TERMINATE:
      return `O_TERMINATE.<${expr.production}>`

    default:
      return expr.op
  }
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
module.exports = function search(walk, [ query ], ast, sourceCode, options = {}) {
  const debug = options.debug === true;

  return (
    evaluatePipeline
    (
      createEvaluationPipeline
      (
        trace(debug, 'QUERY', 'json')(query)
      ),
      {
        debug,
        walk, // we need to expose this to evaluate expressions
        nodes: [ ast ]
      }
    )
    .map
    (
      createMatchSerializer({ sourceCode })
    )
  )
};

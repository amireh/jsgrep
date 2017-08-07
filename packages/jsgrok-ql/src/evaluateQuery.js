const invariant = require('invariant')
const { head, partial, pipe, trace } = require('./functional');
const createMatchSerializer = require('./createMatchSerializer')
const expressionEvaluators = require('./expressions')
const macroEvaluators = require('./macros')
const expandMacros = require('./expandQueryMacros')
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
        lhs: expr.lhs, // we need to keep these for logging
        rhs: expr.rhs,
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

      if (typeof products[expr.production] !== 'function') {
        invariant(false,
          `Unsupported production: [${head(resolveOutputTerm(expr.lhs))} . ${head(resolveOutputTerm(expr.rhs))}]`
        )
      }

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
    .map(x => x.evaluate)
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

const expandExpression = (walk, program, expr) => {
  if (!expr) {
    return null;
  }

  if (expr[0] === 'function-call') {
    return expandFunctionCall(walk, program, expr)
  }

  const [ evaluator ] = macroEvaluators.filter(x => x.on === expr[0])

  if (!evaluator) {
    return expr;
  }

  let nextExpression = null

  walk(program, evaluator.expand(expr, x => { nextExpression = x }));

  return nextExpression || expr
}

const isMacroExpression = expr => {
  return Array.isArray(expr) && [ 'imported-identifier' ].indexOf(expr[0]) > -1
}

const getExpandedMacroValue = (expr, value) => {
  switch (expr[0]) {
    case 'imported-identifier':
      return value[1]

    default:
      invariant(false, `Unrecognized macro expression "${expr[0]}"`)
  }
}

const expandFunctionCall = (walk, program, expr) => {
  const nextData = Object.assign({}, expr[1])

  if (isMacroExpression(expr[1].id)) {
    const expandedId = expandExpression(walk, program, expr[1].id)

    if (expandedId) {
      nextData.id = getExpandedMacroValue(expr[1].id, expandedId)
    }
  }

  return [ expr[0], nextData ]
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
        trace
        (
          debug, 'EXPANDED_QUERY', 'json'
        )
        (
          expandMacros
          (
            walk,
            ast,
            trace(debug, 'QUERY', 'json')
            (
              query
            )
          )
        )
      ),
      {
        debug,
        walk, // we need to expose this to evaluate expressions
        nodes: [ ast ]
      }
    )
  )
  .map
  (
    createMatchSerializer({ sourceCode })
  )
};

const MAX_LINE_LEN = 80;
const { pipe } = require('../functional');
const invariant = require('invariant')

const expressionEvaluators = [
  require('./function-call')
]

const { t } = require('./utils')
const {
  L_ANY,
  L_THIS,
  O_EVAL,
  O_EVAL_MONOMIAL,
  O_PRODUCT,
} = require('./constants')

const cram = line => line.substr(0, MAX_LINE_LEN - 3);
// const util = require('util')
// const inspect = x => util.inspect(x, { depth:  null, colors: true })

const createSerializer = ({ sourceCode }) => {
  const sourceLines = sourceCode.split('\n');

  return node => {
    const line = sourceLines[node.loc.start.line - 1];
    const startLine = node.loc.start.line;
    const startColumn = node.loc.start.column;
    const endColumn = node.loc.end.line !== node.loc.start.line ?
      line.length :
      node.loc.end.column
    ;

    if (line.length > MAX_LINE_LEN) {
      const token = cram(line.substring(startColumn, endColumn));
      const leadingChars = startColumn;
      const trailingChars = line.length - endColumn;
      const leadingString = leadingChars > 0 ?
        `+${leadingChars} ... ` :
        ``
      ;

      const trailingString = trailingChars > 0 ?
        ` ... +${trailingChars}` :
        ``
      ;

      return {
        match: `${leadingString}${token}${trailingString}`,
        line: startLine,
        start: leadingString.length,
        end: leadingString.length + token.length,
      }
    }
    else {
      return {
        match: line,
        line: startLine,
        start: startColumn,
        end: endColumn
      }
    }
  }
}

const resolveTypeOf = instruction => {
  switch (instruction.op) {
    case O_PRODUCT:
      return resolveTypeOf(instruction.rhs);

    case O_EVAL:
    case O_EVAL_MONOMIAL:
      return instruction.expr[0];

    default:
      return null;
  }
}

const evaluateOperation = (state, expr) => {
  switch (expr.op) {
    case 'O_PRODUCT':
      return applyProduct(state, expr.lhs, expr.rhs)

    case 'O_EVAL':
      return evaluateExpression(state, expr.expr);

    case 'O_EVAL_MONOMIAL':

      return (
        terminations[resolveTypeOf(expr)]
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

const terminations = {
  'function-call': (state, nodes) => {
    return nodes.filter(node => {
      return !t.memberExpression(node.callee)
    })
  }
}

const products = {
  'function-call . function-call': (state, lhsExpr, rhsExpr) => {
    const rhsNodes = evaluateOperation(state, rhsExpr)
    const lhsNodes = evaluateOperation(state, lhsExpr)

    return rhsNodes.filter(node => {
      return t.memberExpression(node.callee) && lhsNodes.some(otherNode => {
        return node.callee.object === otherNode
      })
    })
  },

  'identifier . function-call': (state, lhsExpr, rhsExpr) => {
    const receiver = lhsExpr.expr[1]
    const rhsNodes = evaluateOperation(state, rhsExpr)

    const collectMatchingReceiverCalls = node => {
      if (receiver === L_ANY) {
        return t.memberExpression(node.callee);
      }
      else if (receiver === L_THIS) {
        return t.thisExpression(node.callee.object);
      }
      else if (t.identifier(node.callee.object)) {
        return receiver === node.callee.object.name;
      }
      else {
        return false;
      }
    }

    return rhsNodes.filter(collectMatchingReceiverCalls)
  }
}

const applyProduct = (state, lhsExpr, rhsExpr) => {
  // console.log('lhs query?', lhsExpr)
  // console.log('rhs query?', rhsExpr)
  // console.log('lhs type?', resolveTypeOf(lhsExpr))
  // console.log('rhs type?', resolveTypeOf(rhsExpr))

  const productType = `${resolveTypeOf(lhsExpr)} . ${resolveTypeOf(rhsExpr)}`
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
  const serializeMatch = createSerializer({ sourceCode })
  const matchingNodes = evaluateOperation({ nodes: [ ast ], walk }, query[0]);

  return matchingNodes.map(serializeMatch)
};
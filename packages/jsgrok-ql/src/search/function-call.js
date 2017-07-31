const { t } = require('./utils');
const {
  L_ANY,
  L_THIS,
  L_VOID,
  L_CLASS_NUMBER,
  L_CLASS_REGEXP,
  L_CLASS_STRING,
} = require('../constants');
const notVoid = x => x !== L_VOID

const collectMatchingStaticFunctionCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (!t.identifier(node.callee)) {
      return false;
    }
    else if (query.id !== node.callee.name) {
      return false;
    }
    else {
      return true;
    }
  })
}

const collectMatchingMemberFunctionCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (!t.memberExpression(node.callee)) {
      return false;
    }
    else if (!t.identifier(node.callee.property)) {
      return false;
    }
    else if (query.id !== node.callee.property.name) {
      return false;
    }
    else {
      return true;
    }
  })
}

const collectMatchingReceiverCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (query.receiver === L_ANY) {
      return true;
    }
    else if (query.receiver === L_THIS) {
      return t.thisExpression(node.callee.object);
    }
    else if (t.identifier(node.callee.object)) {
      return query.receiver === node.callee.object.name;
    }
    else {
      return false;
    }
  })
}

const collectMatchingArgumentCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (!query.arguments.length) {
      return node;
    }
    else if (query.arguments[0] === L_VOID) {
      return node.arguments.length === 0;
    }
    else if (query.arguments.length !== node.arguments.length) {
      return false;
    }
    else {
      return true;
    }
  })
}

const collectMatchingArgumentValueCalls = (query, nodes) => {
  return nodes.filter(node => {
    return query.arguments.filter(notVoid).every((argSpec, index) => {
      const argNode = node.arguments[index]

      if (argSpec === L_ANY) {
        return true;
      }
      else if (argSpec === L_CLASS_STRING) {
        return isStringArgument(argNode)
      }
      else if (argSpec === L_CLASS_NUMBER) {
        return isNumberArgument(argNode)
      }
      else if (argSpec === L_CLASS_REGEXP) {
        return isRegExpArgument(argNode)
      }
      else if (argSpec.regexp) {
        return (
          isRegExpArgument(argNode) &&
          isRegExpMatching(argSpec.regexp, argNode)
        )
      }
      else if (typeof argSpec === 'number') {
        return t.literal(argNode) && argNode.value === argSpec;
      }
      else if (typeof argSpec === 'string') {
        return t.literal(argNode) && argNode.value === argSpec;
      }
      else {
        return false;
      }
    })
  })
}

const isNumberArgument = node => (
  t.literal(node) && typeof node.value === 'number' ||
  (
    t.unaryExpression(node) &&
    t.literal(node.argument) &&
    typeof node.argument.value === 'number'
  ) ||
  (
    t.callExpression(node) &&
    t.identifier(node.callee) &&
    node.callee.name === 'Number'
  )
)

const isStringArgument = node => (
  t.literal(node) && typeof node.value === 'string' ||
  (
    t.callExpression(node) &&
    t.identifier(node.callee) &&
    node.callee.name === 'String'
  )
)

const isRegExpArgument = node => (
  t.literal(node) && node.value instanceof RegExp ||
  (
    t.newExpression(node) &&
    node.callee.name === 'RegExp'
  )
)

const isRegExpMatching = (source, node) => {
  if (t.literal(node)) {
    // acorn seems to generate this node.regex struct which is super handy
    return node.regex && node.regex.pattern === source;
  }
  else if (t.newExpression(node)) {
    return t.literal(node.arguments[0]) && node.arguments[0].value === source;
  }
  else {
    return false;
  }
}

// we'll avoid pipe / compose for the overhead
const collectStaticCalls = (query, nodes) => (
  collectMatchingArgumentValueCalls
  (
    query,
    collectMatchingArgumentCalls
    (
      query,
      collectMatchingStaticFunctionCalls
      (
        query,
        nodes
      )
    )
  )
)

const collectMemberCalls = (query, nodes) => (
  collectMatchingMemberFunctionCalls
  (
    query,
    collectMatchingReceiverCalls
    (
      query,
      collectMatchingArgumentCalls
      (
        query,
        collectMatchingArgumentValueCalls
        (
          query,
          nodes
        )
      )
    )
  )
)

exports.evaluate = expr => {
  if (expr[0] === 'function-call' && expr[1].receiver) {
    return [
      [ 'CallExpression', node => collectMemberCalls(expr[1], [node]) ]
    ]
  }
  else if (expr[0] === 'function-call') {
    return [
      ['CallExpression', node => collectStaticCalls(expr[1], [node]) ]
    ]
  }
}
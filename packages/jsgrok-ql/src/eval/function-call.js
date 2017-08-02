const { t } = require('./utils');
const {
  F_OPT,
  F_NOT,
  L_ANY,
  L_THIS,
  L_VOID,
  L_CLASS_NUMBER,
  L_CLASS_OBJECT,
  L_CLASS_REGEXP,
  L_CLASS_STRING,
  L_EMPTY_OBJECT,
} = require('./constants');

const notVoid = x => x !== L_VOID

const wildcardMatch = (a, b) => {
  if (a.indexOf('.*') > -1) {
    return b.match(a)
  }
  else {
    return a === b
  }
}

const collectMatchingStaticFunctionCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (!t.identifier(node.callee)) {
      return false;
    }
    else {
      return query.id === node.callee.name;
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
    else {
      return query.id === node.callee.property.name;
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
      return isMatchingArgument(argSpec, argNode)
    })
  })
}

const isMatchingArgument = (valueSpec, node) => {
  if (valueSpec === L_ANY) {
    return true;
  }
  else if (valueSpec === L_CLASS_STRING) {
    return isStringArgument(node)
  }
  else if (valueSpec === L_CLASS_NUMBER) {
    return isNumberArgument(node)
  }
  else if (valueSpec === L_CLASS_REGEXP) {
    return isRegExpArgument(node)
  }
  else if (valueSpec === L_CLASS_OBJECT) {
    return isObjectArgument(node)
  }
  else if (valueSpec === L_EMPTY_OBJECT) {
    return isObjectArgument(node) && node.properties.length === 0;
  }
  else if (valueSpec.object) {
    return (
      isObjectArgument(node) &&
      isMatchingObject(valueSpec.object, node)
    )
  }
  else if (valueSpec.regexp) {
    return (
      isRegExpArgument(node) &&
      isMatchingRegExp(valueSpec.regexp, node)
    )
  }
  else if (typeof valueSpec === 'number') {
    return t.literal(node) && node.value === valueSpec;
  }
  else if (typeof valueSpec === 'string') {
    return isStringArgument(node) && isMatchingString(valueSpec, node)
  }
  else {
    return false;
  }
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
  ) ||
  (
    t.newExpression(node) &&
    node.callee.name === 'RegExp'
  )
)

const isRegExpArgument = node => (
  t.literal(node) && node.value instanceof RegExp ||
  (
    t.newExpression(node) &&
    node.callee.name === 'RegExp'
  )
)

const isMatchingString = (valueSpec, node) => {
  if (t.literal(node)) {
    return wildcardMatch(valueSpec, node.value)
  }
  // String('blah')
  else if (t.callExpression(node)) {
    return isMatchingString(valueSpec, node.arguments[0])
  }
  // new String('blah')
  else if (t.newExpression(node)) {
    return isMatchingString(valueSpec, node.arguments[0])
  }
}

const isMatchingRegExp = (source, node) => {
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

const isObjectArgument = node => (
  t.objectExpression(node)
)

const isMatchingObject = (object, node) => {
  // lack fo "properties" indicates that we're searching for an empty object
  if (object.properties === null) {
    return node.properties.length === 0;
  }

  const nodeProps = node.properties.reduce(function(map, propNode) {
    map[extractPropertyKey(propNode)] = extractPropertyValue(propNode)
    return map;
  }, {})

  return object.keys.every(propKey => {
    const [ propSpec, flag ] = extractValueAndFlag(object.properties[propKey]);
    const isDefined = nodeProps.hasOwnProperty(propKey);

    // { ?a }
    if (!isDefined && flag === F_OPT) {
      return true;
    }
    // { ^a }
    else if (isDefined && flag === F_NOT) {
      return false;
    }
    // { a } but there is no a
    else if (!isDefined && flag !== F_NOT) {
      return false;
    }
    else {
      const [ valueSpec, valueFlag ] = extractValueAndFlag(propSpec)
      const ok = isMatchingArgument(valueSpec, nodeProps[propKey])

      if (valueFlag === F_NOT) {
        return !ok
      }
      else {
        return ok
      }
    }
  })
}

const extractValueAndFlag = spec => Array.isArray(spec) ? spec : [ spec, null ];

const extractPropertyKey = node => {
  return t.identifier(node.key) && node.key.name || null;
}

const extractPropertyValue = node => {
  return node.value;
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
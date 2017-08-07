const invariant = require('invariant')
const { t, qt, wildcardMatch } = require('../utils');

const collectMatchingStaticFunctionCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (!t.identifier(node.callee)) {
      return false;
    }
    else {
      return query.id.name === node.callee.name;
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
      return query.id.name === node.callee.property.name;
    }
  })
}

const collectMatchingArityCalls = (query, nodes) => {
  return nodes.filter(node => {
    if (!query.arguments.length) {
      return node;
    }
    else if (qt.voidLiteral(query.arguments[0])) {
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
    return query.arguments.every((argSpec, index) => {
      const argNode = node.arguments[index]
      return isMatchingArgument(argSpec, argNode)
    })
  })
}

const isMatchingArgument = (term, node) => {
  if (qt.anyLiteral(term) || qt.voidLiteral(term)) {
    return true;
  }
  else if (qt.object(term) && qt.anyObject(term)) {
    return isObjectArgument(node)
  }
  else if (qt.object(term) && qt.emptyObject(term)) {
    return isObjectArgument(node) && node.properties.length === 0;
  }
  else if (qt.object(term)) {
    return isObjectArgument(node) && isMatchingObject(term, node)
  }
  else if (qt.regexp(term) && qt.anyLiteral(term.pattern)) {
    return isRegExpArgument(node)
  }
  else if (qt.regexp(term) && qt.literal(term.pattern)) {
    return (
      isRegExpArgument(node) &&
      isMatchingRegExp(term.pattern.value, node)
    )
  }
  else if (qt.number(term) && qt.anyLiteral(term.value)) {
    return isNumberArgument(node)
  }
  else if (qt.number(term) && qt.literal(term.value)) {
    return t.literal(node) && node.value === term.value.value;
  }
  else if (qt.number(term)) {
    invariant(false, `Unexpected Number value: ${term.value && term.value.type || JSON.stringify(term)}`)
  }
  else if (qt.string(term) && qt.anyLiteral(term.value)) {
    return isStringArgument(node);
  }
  else if (qt.string(term) && qt.literal(term.value)) {
    return isStringArgument(node) && isMatchingString(term.value.value, node)
  }
  else if (qt.string(term)) {
    invariant(false, `Unexpected String value: ${term.value && term.value.type || JSON.stringify(term)}`)
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
  (
    t.literal(node) &&
    typeof node.value === 'string'
  ) ||
  (
    t.callExpression(node) &&
    t.identifier(node.callee) &&
    node.callee.name === 'String'
  ) ||
  (
    t.newExpression(node) &&
    node.callee.name === 'String'
  ) ||
  (
    t.templateLiteral(node)
  )
)

const isRegExpArgument = node => (
  t.literal(node) && node.value instanceof RegExp ||
  (
    t.newExpression(node) &&
    node.callee.name === 'RegExp'
  )
)

const isMatchingString = (needle, node) => {
  if (t.literal(node)) {
    return wildcardMatch(needle, node.value)
  }
  // String('blah')
  else if (t.callExpression(node)) {
    return isMatchingString(needle, node.arguments[0])
  }
  // new String('blah')
  else if (t.newExpression(node)) {
    return isMatchingString(needle, node.arguments[0])
  }
  else if (t.templateLiteral(node)) {
    return wildcardMatch(needle, node.quasis.map(x => x.value && x.value.cooked || '').join(''))
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

const isMatchingObject = (term, node) => {
  // lack fo "properties" indicates that we're searching for an empty object
  if (term.properties === null) {
    return node.properties.length === 0;
  }

  const nodeProps = node.properties.reduce(function(map, propNode) {
    map[extractPropertyKey(propNode)] = extractPropertyValue(propNode)
    return map;
  }, {})

  return term.properties.every(propTerm => {
    const isDefined = nodeProps.hasOwnProperty(propTerm.key);

    // { ?a }
    if (!isDefined && qt.optionalProperty(propTerm)) {
      return true;
    }
    // { ^a }
    else if (isDefined && qt.negatedProperty(propTerm)) {
      return false;
    }
    // { a } but there is no a
    else if (!isDefined && !qt.negatedProperty(propTerm)) {
      return false;
    }
    else {
      const valueSpec = propTerm.value
      const ok = isMatchingArgument(valueSpec, nodeProps[propTerm.key])

      if (qt.negatedPropertyValue(propTerm)) {
        return !ok
      }
      else {
        return ok
      }
    }
  })
}

const extractPropertyKey = node => {
  return t.identifier(node.key) && node.key.name || null;
}

const extractPropertyValue = node => {
  return node.value;
}

// we'll avoid pipe / compose for the overhead
const collectCalls = (query, nodes) => (
  collectMatchingArgumentValueCalls
  (
    query,
    collectMatchingArityCalls
    (
      query,
      collectMatchingStaticFunctionCalls
      (
        query,
        nodes
      )
      .concat
      (
        collectMatchingMemberFunctionCalls
        (
          query,
          nodes
        )
      )
    )
  )
)

exports.walk = (expr, f) => {
  if (expr.type === 'FunctionCall') {
    f(expr.id)
  }
}

exports.evaluate = expr => {
  if (expr.type === 'FunctionCall') {
    return [
      ['CallExpression', node => collectCalls(expr, [node]) ]
    ]
  }
}

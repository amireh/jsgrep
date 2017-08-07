const invariant = require('invariant')
const { t, qt, wildcardMatch } = require('../utils');
const xor = (a, b) => (!!a ^ !!b) === 1

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
    return query.arguments.every((term, index) => {
      return xor(
        isMatchingArgument(term, node.arguments[index]),
        term.negated
      )
    })
  })
}

const isMatchingArgument = (term, node) => {
  switch (term.type) {
    case 'AnyLiteral':
    case 'VoidLiteral':
      return true

    case 'Object':
      if (!isObjectArgument(node)) {
        return false;
      }
      else if (qt.anyObject(term)) {
        return true
      }
      else if (qt.emptyObject(term)) {
        return node.properties.length === 0;
      }
      else {
        return isMatchingObject(term, node)
      }

    case 'RegExp':
      if (!isRegExpArgument(node)) {
        return false;
      }
      else if (qt.anyLiteral(term.pattern)) {
        return true
      }
      else if (qt.literal(term.pattern)) {
        return isMatchingRegExp(term.pattern.value, node)
      }
      else {
        invariant(false, `Unrecognized RegExp pattern type "${term.pattern}"`)

        return false;
      }

    case 'Number':
      if (!isNumberArgument(node)) {
        return false;
      }
      else if (qt.anyLiteral(term.value)) {
        return true;
      }
      else if (qt.literal(term.value)) {
        return isMatchingNumber(term.value.value, node)
      }
      else {
        invariant(false, `Unexpected Number value: ${term.value && term.value.type || JSON.stringify(term)}`)

        return false;
      }

    case 'String':
      if (!isStringArgument(node)) {
        return false;
      }
      else if (qt.anyLiteral(term.value)) {
        return true;
      }
      else if (qt.literal(term.value)) {
        return isMatchingString(term.value.value, node)
      }
      else {
        invariant(false, `Unexpected String value: ${term.value && term.value.type || JSON.stringify(term)}`)

        return false;
      }

    case 'Boolean':
      if (!isBooleanArgument(node)) {
        return false;
      }
      else if (qt.anyLiteral(term.value)) {
        return true;
      }
      else {
        return isMatchingBoolean(term.value, node)
      }

    default:
      invariant(false, `Unrecognized argument type expression "${term.type}"`)

      return false;
  }
}

const isNumberArgument = node => (
  (
    t.literal(node) && typeof node.value === 'number'
  ) ||
  (
    t.unaryExpression(node) &&
    t.literal(node.argument) &&
    typeof node.argument.value === 'number'
  ) ||
  (
    t.callExpression(node) &&
    t.identifier(node.callee) &&
    node.callee.name === 'Number'
  ) ||
  (
    t.newExpression(node) &&
    node.callee.name === 'Number'
  )
)

const isMatchingNumber = (value, node) => {
  if (t.literal(node)) {
    return value === node.value;
  }
  else if (t.newExpression(node) || t.callExpression(node)) {
    return value === interpolateNumber(node.arguments[0])
  }
  else {
    return false;
  }
}

const interpolateNumber = node => {
  if (t.literal(node)) {
    return parseFloat(node.value)
  }
  else if (t.templateLiteral(node)) {
    return parseFloat(t.templateLiteralValueOf(node))
  }
  else {
    return NaN
  }
}

const isStringArgument = node => (
  (
    t.literal(node) && typeof node.value === 'string'
  ) ||
  (
    t.callExpression(node) && node.callee.name === 'String'
  ) ||
  (
    t.newExpression(node) && node.callee.name === 'String'
  ) ||
  (
    t.templateLiteral(node)
  )
)

const isRegExpArgument = node => (
  (t.literal(node) && node.value instanceof RegExp) ||
  (
    t.newExpression(node) &&
    node.callee.name === 'RegExp'
  )
)

const isMatchingString = (needle, node) => {
  if (t.literal(node)) {
    return wildcardMatch(needle, node.value)
  }
  // `blah`
  else if (t.templateLiteral(node)) {
    return wildcardMatch(needle, t.templateLiteralValueOf(node))
  }
  // String('blah') | String(`blah`)
  else if (t.callExpression(node)) {
    return isMatchingString(needle, node.arguments[0])
  }
  // new String('blah') | new String(`blah`)
  else if (t.newExpression(node)) {
    return isMatchingString(needle, node.arguments[0])
  }
}

const isMatchingRegExp = (source, node) => {
  if (t.literal(node)) {
    // acorn seems to generate this node.regex struct which is super handy
    return node.regex && node.regex.pattern === source;
  }
  else if (t.newExpression(node)) {
    return t.literal(node.arguments[0]) &&
    // new RegExp('foo')
    (
      t.literal(node.arguments[0]) &&
      t.literalOf(source, node.arguments[0])
    ) ||
    // new RegExp(`foo`)
    (
      t.templateLiteral(node.arguments[0]) &&
      t.templateLiteralOf(source, node.arguments[0])
    );
  }
  else {
    return false;
  }
}

const isBooleanArgument = node => (
  (
    t.literal(node) && (
      node.value === true ||
      node.value === false
    )
  ) ||
  (
    t.callExpression(node) && node.callee.name === 'Boolean'
  ) ||
  (
    t.newExpression(node) && node.callee.name === 'Boolean'
  )
)

const Maybe = false
const isMatchingBoolean = (value, node) => {
  // Boolean(true) | Boolean(false)
  if (t.literal(node) && typeof node.value === 'boolean') {
    return node.value === value;
  }
  // Boolean('foobar') -> true | Boolean('') -> false
  else if (t.literal(node)) {
    return (!!node.value) === value
  }
  // Boolean(something) -> Maybe? but we have no maybe right now so just say no
  else if (t.identifier(node)) {
    return Maybe
  }
  // Boolean(?) | new Boolean(?)
  else if (t.callExpression(node) || t.newExpression(node)) {
    // Boolean() | new Boolean()
    if (!node.arguments[0]) {
      return value === false;
    }
    else {
      return node.arguments[0] && isMatchingBoolean(value, node.arguments[0])
    }
  }
  else {
    invariant(false, `Unsupported Boolean node type "${node.type}"`)

    return false
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

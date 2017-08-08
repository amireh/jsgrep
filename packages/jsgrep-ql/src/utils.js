const { L_ANY, F_OPT, F_NOT } = require('./constants')
const t = {
  identifier: x => !!(x && x.type === 'Identifier'),
  identifierOf: (name, node) => t.identifier(node) && (
    name === L_ANY ||
    name === node.name
  ),
  importDefaultSpecifier: x => !!(x && x.type === 'ImportDefaultSpecifier'),
  importSpecifierOf: name => node => !!(node && node.type === 'ImportSpecifier') && (
    t.identifier(node.imported) &&
    node.imported.name === name
  ),
  literal: x => !!(x && x.type === 'Literal'),
  literalOf: (name, x) => t.literal(x) && (
    x.value === name
  ),
  callExpression: x => !!(x && x.type === 'CallExpression'),
  memberExpression: x => !!(x && x.type === 'MemberExpression'),
  newExpression: x => !!(x && x.type === 'NewExpression'),
  objectExpression: x => !!(x && x.type === 'ObjectExpression'),
  thisExpression: x => !!(x && x.type === 'ThisExpression'),
  unaryExpression: x => !!(x && x.type === 'UnaryExpression'),

  templateLiteral: node => !!(node && node.type === 'TemplateLiteral'),
  templateLiteralValueOf: node => node.quasis.map(x => x.value && x.value.cooked || '').join(''),
  templateLiteralOf: (value, node) => value === t.templateLiteralValueOf(node),

  arrowFunctionExpression: node => !!(node && node.type === 'ArrowFunctionExpression'),
  functionExpression: node => !!(node && node.type === 'FunctionExpression'),
  blockStatement: node => !!(node && node.type === 'BlockStatement'),
  returnStatement: node => !!(node && node.type === 'ReturnStatement'),
}

exports.t = t

// query tools or query queries if you like
exports.qt = {
  anyLiteral: term => term.type === 'AnyLiteral',
  greedyAnyLiteral: term => term.type === 'GreedyAnyLiteral',
  voidLiteral: term => term.type === 'VoidLiteral',
  thisLiteral: term => term.type === 'VoidLiteral',

  number: term => term.type === 'Number',
  string: term => term.type === 'String',
  regexp: term => term.type === 'RegExp',
  object: term => term.type === 'Object',

  anyObject: term => term.properties === null,
  emptyObject: term => term.properties && term.properties.length === 0,

  identifier: term => term.type === 'Identifier',

  literal: term => term.type === 'Literal',

  optionalProperty: term => term.keyFlag === F_OPT,
  optionalPropertyValue: term => term.valueFlag === F_OPT,
  negatedProperty: term => term.keyFlag === F_NOT,
  negatedPropertyValue: term => term.valueFlag === F_NOT,
}

exports.wildcardMatch = (a, b) => {
  if (a.indexOf('.*') > -1) {
    return b.match(a)
  }
  else {
    return a === b
  }
}
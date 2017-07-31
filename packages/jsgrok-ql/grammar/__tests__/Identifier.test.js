const { createTokenTests } = require('./utils')

createTokenTests('AnyLiteral', {
  ok: [
    [ '*', 'L_ANY' ]
  ]
})

createTokenTests('ThisLiteral', {
  ok: [
    [ 'this', 'L_THIS' ]
  ]
})

createTokenTests('VoidLiteral', {
  ok: [
    [ 'void', 'L_VOID' ]
  ]
})

createTokenTests('StringLiteral', {
  ok: [
    [ '"Hello World!"', 'Hello World!' ]
  ]
})

createTokenTests('BuiltInClassLiteral', {
  ok: [
    [ 'String()', 'L_CLASS_STRING' ],
    [ 'Number()', 'L_CLASS_NUMBER' ],
    [ 'RegExp()', 'L_CLASS_REGEXP' ],
    [ 'Object()', 'L_CLASS_OBJECT' ],
  ]
})

createTokenTests('RegExpLiteral', {
  ok: [
    [ '/foo/', { regexp: 'foo' } ],
  ]
})

createTokenTests('ObjectLiteral', {
  ok: [
    [ '{}',               'L_EMPTY_OBJECT' ],

    [ '{ a }',            { object: { keys: ['a'],      properties: { 'a': [['L_ANY']] } } } ],
    [ '{ a: "b" }',       { object: { keys: ['a'],      properties: { 'a': [['b']] } } } ],
    [ '{ a: 42 }',        { object: { keys: ['a'],      properties: { 'a': [[42]] } } } ],
    [ '{ a: /foo/ }',     { object: { keys: ['a'],      properties: { 'a': [[{ regexp: 'foo' }]] } } } ],
    [ '{ a: Object() }',  { object: { keys: ['a'],      properties: { 'a': [['L_CLASS_OBJECT']] } } } ],
    [ '{ a: null }',      { object: { keys: ['a'],      properties: { 'a': [['L_NULL']] } } } ],
    [ '{ a, b }',         { object: { keys: ['a','b'],  properties: { 'a': [['L_ANY']], 'b': [['L_ANY']] } } } ],
    [ '{ a: "b", b: * }', { object: { keys: ['a','b'],  properties: { 'a': [['b']], 'b': [['L_ANY']] } } } ],

    // Flags
    [ '{ ?a }',            { object: { keys: ['a'], properties: { 'a': [['L_ANY'], 'F_OPT'] } } } ],
    [ '{ ^a }',            { object: { keys: ['a'], properties: { 'a': [['L_ANY'], 'F_NOT'] } } } ],
    [ '{ ?a, ^b }',        { object: { keys: ['a','b'], properties: { 'a': [['L_ANY'], 'F_OPT'], 'b': [['L_ANY'], 'F_NOT'] } } } ],
  ]
})

createTokenTests('NumberLiteral', {
  ok: [
    [ '0', 0 ],
    [ '0.42', 0.42 ],
    [ '12', 12 ],
    [ '12.4', 12.4 ],

    // negatives
    [ '-0.5', -0.5 ],
    [ '-7', -7 ],
  ]
})

createTokenTests('Identifier', {
  ok: [
    [ 'x' ],
    [ '_' ],
    [ 'foo' ],
    [ '_foo' ],
    [ 'foo_' ],
    [ '_foo_' ],
  ],

  notOk: [
    [ '-' ],
    [ '#' ],
  ]
})

createTokenTests('Receiver', {
  ok: [
    [ '*', 'L_ANY' ],
    [ 'this', 'L_THIS' ],
    [ 'foo', 'foo' ]
  ],
})

createTokenTests('FunctionCallExpression', {
  ok: [
    [ 'foo()', ["function-call", { arguments: [], id: 'foo', receiver: null }] ],

    // Member expression call receivers
    [ 'x.foo()', ["function-call", { arguments: [], id: 'foo', receiver: 'x' }] ],
    [ 'this.foo()', ["function-call", { arguments: [], id: 'foo', receiver: 'L_THIS' }] ],
    [ '*.foo()', ["function-call", { arguments: [], id: 'foo', receiver: 'L_ANY' }] ],

    // <ARGUMENTS>

    // VoidLiteral argument
    [ 'foo(void)', ["function-call", { arguments: ['L_VOID'], id: 'foo', receiver: null }] ],

    // TypeExpression::AnyLiteral argument
    [ 'foo(*)', ["function-call", { arguments: ['L_ANY'], id: 'foo', receiver: null }] ],

    // TypeExpression::NumberLiteral argument
    [ 'foo(1)', ["function-call", { arguments: [1], id: 'foo', receiver: null }] ],

    // TypeExpression::StringLiteral argument
    [ 'foo(\'Hello\')', ["function-call", { arguments: ['Hello'], id: 'foo', receiver: null }] ],
    [ 'foo("Hello")', ["function-call", { arguments: ['Hello'], id: 'foo', receiver: null }] ],

    [ 'foo(bar)', ["function-call", { arguments: ['bar'], id: 'foo', receiver: null }] ],

    // TypeExpression::ObjectLiteral argument
    [ 'foo({})', ["function-call", { arguments: ['L_EMPTY_OBJECT'], id: 'foo', receiver: null }] ],

    // TypeExpression::BuiltInClassLiteral argument
    [ 'foo(String())', ["function-call", { arguments: ['L_CLASS_STRING'], id: 'foo', receiver: null }] ],
    [ 'foo(Number())', ["function-call", { arguments: ['L_CLASS_NUMBER'], id: 'foo', receiver: null }] ],
    [ 'foo(RegExp())', ["function-call", { arguments: ['L_CLASS_REGEXP'], id: 'foo', receiver: null }] ],
    [ 'foo(Object())', ["function-call", { arguments: ['L_CLASS_OBJECT'], id: 'foo', receiver: null }] ],

    // </ARGUMENTS>

    // <MULTIPLE ARGUMENTS>

    // TypeExpression::AnyLiteral argument
    [ 'foo(*, *)', ["function-call", { arguments: ['L_ANY', 'L_ANY'], id: 'foo', receiver: null }] ],

    // TypeExpression::NumberLiteral argument
    [ 'foo(-0.5, 42)', ["function-call", { arguments: [-0.5, 42], id: 'foo', receiver: null }] ],

    // TypeExpression::Identifier argument
    [ 'foo(bar, baz)', ["function-call", { arguments: ['bar', 'baz'], id: 'foo', receiver: null }] ],
    [ 'foo(bar, bar)', ["function-call", { arguments: ['bar', 'bar'], id: 'foo', receiver: null }] ],

    // Mixed

    [ 'foo(*, bar, 10)', ["function-call", { arguments: ['L_ANY', 'bar', 10], id: 'foo', receiver: null }] ],
    [ 'foo(bar, *, 10)', ["function-call", { arguments: ['bar', 'L_ANY', 10], id: 'foo', receiver: null }] ],
    [ 'foo(10, bar, *)', ["function-call", { arguments: [10, 'bar', 'L_ANY'], id: 'foo', receiver: null }] ],

    // </MULTIPLE ARGUMENTS>
  ],

  notOk: [
    [ 'void.foo()' ],

    [ 'foo(void, 10)' ],
    [ 'foo(10, void)' ],
  ]
})
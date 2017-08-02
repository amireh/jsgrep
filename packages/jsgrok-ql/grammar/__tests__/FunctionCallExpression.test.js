const { createTokenTests } = require('./utils')

createTokenTests('FunctionCallExpression', {
  ok: [
    [ 'foo()', ["function-call", { arguments: [], id: 'foo', receiver: null }] ],

    // `x` as a receiver
    [ 'x.foo()', ["function-call", { arguments: [], id: 'foo', receiver: 'x' }] ],

    // `this` as a receiver
    [ 'this.foo()', ["function-call", { arguments: [], id: 'foo', receiver: 'L_THIS' }] ],

    // any receiver
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

    // forbids reserved keywords as identifiers
    [ 'this()' ],
    [ 'void()' ],
    [ '*()'    ],

    // no receiver defined, should use *. instead
    [ '.()'    ],
  ]
})
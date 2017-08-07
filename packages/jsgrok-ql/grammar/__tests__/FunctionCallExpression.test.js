const { createTokenTests, builders: b } = require('./utils')

createTokenTests('FunctionCallExpression', {
  ok: [
    [ 'foo()', {
      expressions: [{
        name: 'function-call',
        props: {
          arguments: [],
          id: b.identifier('foo')
        }
      }]
    }],

    // <ARGUMENTS>

    // VoidLiteral argument
    [ 'foo(void)', {
      expressions: [
        {
          name: "function-call",
          props: {
            arguments: [ b.voidLiteral() ],
            id: b.identifier('foo')
          }
        }
      ]
    }],

    // TypeExpression::AnyLiteral argument
    [ 'foo(*)', {
      expressions: [
        {
          name: "function-call",
          props: {
            arguments: [b.anyLiteral()],
            id: b.identifier('foo')
          }
        }
      ]
    }],

    // TypeExpression::NumberLiteral argument
    [ 'foo(1)', {
      expressions: [
        {
          name: "function-call",
          props: {
            arguments: [b.number(b.literal(1))],
            id: b.identifier('foo')
          }
        }
      ]
    }],

    // TypeExpression::StringLiteral argument
    [ "foo('Hello')", {
      expressions: [
        {
          name: "function-call",
          props: {
            arguments: [b.string(b.literal('Hello'))],
            id: b.identifier('foo'),
          }
        }
      ]
    }],

    [ 'foo("Hello")', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.string(b.literal('Hello'))], id: b.identifier('foo') }
        }
      ]
    }],

    [ 'foo(bar)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.identifier('bar')], id: b.identifier('foo') }
        }
      ]
    }],

    // TypeExpression::ObjectLiteral argument
    [ 'foo({})', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.object({})], id: b.identifier('foo') }
        }
      ]
    }],

    // TypeExpression::BuiltInClassLiteral argument
    [ 'foo(:string)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.string(b.anyLiteral())], id: b.identifier('foo') }
        }
      ]
    }],

    [ 'foo(:number)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.number(b.anyLiteral())], id: b.identifier('foo') }
        }
      ]
    }],

    [ 'foo(:regexp)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.regexp({ pattern: b.anyLiteral() })], id: b.identifier('foo') }
        }
      ]
    }],

    [ 'foo(:object)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.object({ keys: null, properties: null })], id: b.identifier('foo') }
        }
      ]
    }],

    // </ARGUMENTS>

    // <MULTIPLE ARGUMENTS>

    // TypeExpression::AnyLiteral argument
    [ 'foo(*, *)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.anyLiteral(), b.anyLiteral()], id: b.identifier('foo') }
        }
      ]
    }],

    // TypeExpression::NumberLiteral argument
    [ 'foo(-0.5, 42)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.number(b.literal(-0.5)), b.number(b.literal(42))], id: b.identifier('foo') }
        }
      ]
    }],

    // TypeExpression::Identifier argument
    [ 'foo(bar, baz)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.identifier('bar'), b.identifier('baz')], id: b.identifier('foo') }
        }
      ]
    }],

    [ 'foo(bar, bar)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.identifier('bar'), b.identifier('bar')], id: b.identifier('foo') }
        }
      ]
    }],

    // Mixed

    [ 'foo(*, bar, 10)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.anyLiteral(), b.identifier('bar'), b.number(b.literal(10))], id: b.identifier('foo') }
        }
      ]
    }],

    [ 'foo(bar, *, 10)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.identifier('bar'), b.anyLiteral(), b.number(b.literal(10))], id: b.identifier('foo') }
        }
      ]
    }],

    [ 'foo(10, bar, *)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [b.number(b.literal(10)), b.identifier('bar'), b.anyLiteral()], id: b.identifier('foo') }
        }
      ]
    }],

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
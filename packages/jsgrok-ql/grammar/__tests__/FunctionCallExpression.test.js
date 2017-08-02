const { createTokenTests } = require('./utils')

createTokenTests('FunctionCallExpression', {
  ok: [
    [ 'foo()', {
      expressions: [{
        name: 'function-call',
        props: {
          arguments: [],
          id: 'foo'
        }
      }]
    }],

    // <ARGUMENTS>

    // VoidLiteral argument
    [ 'foo(void)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['L_VOID'], id: 'foo' }
        }
      ]
    }],

    // TypeExpression::AnyLiteral argument
    [ 'foo(*)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['L_ANY'], id: 'foo' }
        }
      ]
    }],

    // TypeExpression::NumberLiteral argument
    [ 'foo(1)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [1], id: 'foo' }
        }
      ]
    }],

    // TypeExpression::StringLiteral argument
    [ 'foo(\'Hello\')', {
      expressions: [
        {
          name: "function-call",
          props: {
            arguments: ['Hello'],
            id: 'foo',
          }
        }
      ]
    }],

    [ 'foo("Hello")', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['Hello'], id: 'foo' }
        }
      ]
    }],

    [ 'foo(bar)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['bar'], id: 'foo' }
        }
      ]
    }],

    // TypeExpression::ObjectLiteral argument
    [ 'foo({})', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['L_EMPTY_OBJECT'], id: 'foo' }
        }
      ]
    }],

    // TypeExpression::BuiltInClassLiteral argument
    [ 'foo(String())', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['L_CLASS_STRING'], id: 'foo' }
        }
      ]
    }],

    [ 'foo(Number())', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['L_CLASS_NUMBER'], id: 'foo' }
        }
      ]
    }],

    [ 'foo(RegExp())', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['L_CLASS_REGEXP'], id: 'foo' }
        }
      ]
    }],

    [ 'foo(Object())', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['L_CLASS_OBJECT'], id: 'foo' }
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
          props: { arguments: ['L_ANY', 'L_ANY'], id: 'foo' }
        }
      ]
    }],

    // TypeExpression::NumberLiteral argument
    [ 'foo(-0.5, 42)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [-0.5, 42], id: 'foo' }
        }
      ]
    }],

    // TypeExpression::Identifier argument
    [ 'foo(bar, baz)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['bar', 'baz'], id: 'foo' }
        }
      ]
    }],

    [ 'foo(bar, bar)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['bar', 'bar'], id: 'foo' }
        }
      ]
    }],

    // Mixed

    [ 'foo(*, bar, 10)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['L_ANY', 'bar', 10], id: 'foo' }
        }
      ]
    }],

    [ 'foo(bar, *, 10)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: ['bar', 'L_ANY', 10], id: 'foo' }
        }
      ]
    }],

    [ 'foo(10, bar, *)', {
      expressions: [
        {
          name: "function-call",
          props: { arguments: [10, 'bar', 'L_ANY'], id: 'foo' }
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
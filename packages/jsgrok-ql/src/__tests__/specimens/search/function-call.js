module.exports = [
  {
    spec: 'function call of any arity',
    query: 'foo()',
    source: `
      foo()
      foo('a')
      foo(a, b, c)
    `,

    matches: [
      { line: 2 },
      { line: 3 },
      { line: 4 },
    ]
  },

  {
    spec: 'function call with one argument of any type',
    query: 'foo(*)',
    source: `
      foo()
      foo('a')
      foo(42)
      foo(a, b, c)
    `.trim(),

    matches: [
      { line: 2 },
      { line: 3 },
    ]
  },

  {
    spec: 'function call with an argument of a NumberLiteral type and value',
    query: 'foo(42)',
    source: `
      foo(42)         // <-- matches
      foo()           // no value at position
      foo('a')        // different type
      foo(Number(42)) // different type
      foo('a', 42)    // different position
    `.trim(),

    matches: [
      { line: 0 },
    ]
  },

  {
    spec: 'function call with an argument of a StringLiteral type and value',
    query: 'foo("Hello World!")',
    source: `
      foo('Hello World!')         // OK
      foo(String("Hello World!")) // OK
      foo()
      foo('Hello')                // different value
      foo('a', "Hello World!")    // different position
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
    ]
  },

  {
    spec: 'function call with a wildcard StringLiteral',
    query: 'foo("Hello.*")',
    source: `
      foo('Hello World!')         // OK
      foo('Hello')                // OK
      foo(String("Hello World!")) // OK
      foo()
      foo('a', "Hello World!")    // different position
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
      { line: 3 },
    ]
  },

  {
    spec: 'function call with argument "void" does not match any function call with arity > 0',
    query: 'foo(void)',
    source: `
      foo()
      foo(1)
      foo(void 0, 1)
      foo(null)
      foo(undefined)
    `.trim(),

    matches: [
      { line: 0 },
    ]
  },

  {
    spec: 'It should not match a function identifier...',
    query: 'foo()',
    source: `
      foo
    `,

    matches: []
  },

  {
    spec: 'using a receiver, it does not match static function calls',
    query: '*.foo()',
    source: `
      foo()
    `,

    matches: []
  },

  {
    spec: 'with * for a receiver: it matches member function calls to all receivers',
    query: '*.foo()',
    source: `
      foo()
      this.foo()
      foo.foo()
    `,

    matches: [
      { line: 3 },
      { line: 4 },
    ]
  },

  {
    spec: 'with "this" for a receiver: it matches member function calls to "this"',
    query: 'this.foo()',
    source: `
      this.foo()
      x.foo()
    `.trim(),

    matches: [
      { line: 1 },
    ]
  },

  {
    spec: 'with "x" for a receiver: it matches member function calls to "x"',
    query: 'x.foo()',
    source: `
      this.foo()
      x.foo()
    `.trim(),

    matches: [
      { line: 2 },
    ]
  },

  {
    spec: 'with String() for an argument: it matches StringLiteral arguments',
    query: 'foo(String())',
    source: `
      foo('a')
      foo("b")
      foo(String('c'))
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
      { line: 3 },
    ]
  },

  {
    spec: 'with Number() for an argument: it matches NumberLiteral arguments',
    query: 'foo(Number())',
    source: `
      foo(1)
      foo(-0.5)
      foo(Number('42'))
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
      { line: 3 },
    ]
  },

  {
    spec: 'with RegExp() for an argument: it matches regexp literals',
    query: 'foo(RegExp())',
    source: `
      foo(/foo/)
    `.trim(),

    matches: [
      { line: 1 },
    ]
  },

  {
    spec: 'with RegExp() for an argument: it matches regexp constructs',
    query: 'foo(RegExp())',
    source: `
      foo(new RegExp('bar'))
    `.trim(),

    matches: [
      { line: 1 },
    ]
  },

  {
    spec: 'with /bar/ for an argument: it matches regexp literals matching that',
    query: 'foo(/bar/)',
    source: `
      foo(/bar/)
      foo(/bar/i)
      foo(new RegExp('bar'))
      foo(new RegExp('bar', 'i'))
      foo(/barz/)
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
      { line: 3 },
      { line: 4 },
    ]
  },

  {
    spec: 'with Object() for an argument: it matches all object literals',
    query: 'foo(Object())',
    source: `
      foo({})
      foo({ foo: '1' })
      foo()
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
    ]
  },

  {
    spec: 'with {} for an argument: it matches object literals that are empty',
    query: 'foo({})',
    source: `
      foo({})
      foo({ foo: '1' })
      foo()
    `.trim(),

    matches: [
      { line: 1 },
    ]
  },

  {
    spec: 'with { a } for an argument: it matches object literals that define the "a" property',
    query: 'foo({ a })',
    source: `
      foo({ a: '1' })
      foo({ b: '1' })
      foo({ a: 1, b: 2 })
    `.trim(),

    matches: [
      { line: 1 },
      { line: 3 },
    ]
  },

  {
    spec: 'with { a: Object() } for an argument: it matches object literals that define the "a" property and have a value that is an object',
    query: 'foo({ a: Object() })',
    source: `
      foo({ a: {} })
      foo({ a: {}, b: 2 })
      foo({ b: {} })
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
    ]
  },

  {
    spec: 'with { a, ?b } it matches object literals that have "a" and maybe have "b"',
    query: 'foo({ a, ?b })',
    source: `
      foo({ a: 1 }) // OK
      foo({ a: 1, b: 3 }) // OK, both
      foo({ b: 5 }) // NOP, a is required
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
    ]
  },

  {
    spec: 'with { ^a } it matches object literals that do not have the "a" property',
    query: 'foo({ ^a })',
    source: `
      foo({ b: 2 })
      foo({})
      foo({ a: 1 })
      foo({ a: 1, b: 2, c: 3 })
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
    ]
  },

  {
    spec: 'with { a, ^b } it matches object literals that do have the "a" property but not the "b" one',
    query: 'foo({ a, ^b })',
    source: `
      foo({ a }) // OK
      foo({}) // NOP, a is required
      foo({ a, b: 2 }) // NOP, b is there
    `.trim(),

    matches: [
      { line: 1 },
    ]
  },

  {
    spec: 'with { a: ^Number() } it matches object literals that do have the "a" property but is not a number',
    query: 'foo({ a: ^Number() })',
    source: `
      foo({ a }) // OK, don't know what it is
      foo({ a: '1' }) // OK, not a number
      foo({ a: 4 }) // NOP
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
    ]
  },
];

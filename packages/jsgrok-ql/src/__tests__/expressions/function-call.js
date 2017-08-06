const { matchify } = require('../utils')

module.exports = [
  matchify({
    spec: 'function call of any arity',
    query: 'foo()',
    source: `
      [+] foo()
      [+] foo('a')
      [+] foo(a, b, c)
    `,
  }),

  matchify({
    spec: 'function call with one argument of any type',
    query: 'foo(*)',
    source: `
      [+] foo('a')
      [+] foo(42)
      [ ] foo()
      [ ] foo(a, b, c)
    `,
  }),

  matchify({
    spec: 'function call with an argument of a NumberLiteral type and value',
    query: 'foo(42)',
    source: `
      [+] foo(42)         // <-- matches
      [ ] foo()           // no value at position
      [ ] foo('a')        // different type
      [ ] foo(Number(42)) // different type
      [ ] foo('a', 42)    // different position
    `,
  }),

  matchify({
    spec: 'function call with an argument of a StringLiteral type and value',
    query: 'foo("Hello World!")',
    source: `
      [+] foo('Hello World!')
      [+] foo(String("Hello World!"))
      [ ] foo()                       // different arity
      [ ] foo('Hello')                // different value
      [ ] foo('a', "Hello World!")    // different position
    `,
  }),

  matchify({
    spec: 'function call with a wildcard StringLiteral',
    query: 'foo("Hello.*")',
    source: `
      + foo('Hello World!')
      + foo('Hello')
      + foo(String("Hello World!"))
        foo()
        foo('a', "Hello World!")    // different position
    `,
  }),

  matchify({
    spec: 'function call with argument "void" does not match any function call with arity > 0',
    query: 'foo(void)',
    source: `
      + foo()
        foo(1)
        foo(void 0, 1)
        foo(null)
        foo(undefined)
    `,
  }),

  matchify({
    spec: 'with String() for an argument: it matches StringLiteral arguments',
    query: 'f(String())',
    source: `
      + f('a')
      + f("b")
      + f(String('c'))
        f('a', 'b')
        f()
        f(42)
        f({})
    `,
  }),

  matchify({
    spec: 'with Number() for an argument: it matches NumberLiteral arguments',
    query: 'f(Number())',
    source: `
      + f(1)
      + f(-0.5)
      + f(Number('42'))
        f()
        f('a')
        f(2, 2)
    `,
  }),

  matchify({
    spec: 'with RegExp() for an argument: it matches regexp literals',
    query: 'f(RegExp())',
    source: `
      + f(/foo/)
      + f(new RegExp('bar'))
        f('asdf')
        f('/foo/')
    `,
  }),

  matchify({
    spec: 'with /foo/ for an argument: it matches regexp literals and constructs with equal pattern',
    query: 'f(/foo/)',
    source: `
      + f(/foo/)
      + f(/foo/i)
      + f(new RegExp('foo'))
      + f(new RegExp('foo', 'i'))
        f(/bar/)
        f(new RegExp('bar'))
    `,
  }),

  matchify({
    spec: 'with Object() for an argument: it matches all object literals',
    query: 'foo(Object())',
    source: `
      + foo({})
      + foo({ foo: '1' })
        foo()
    `,
  }),

  matchify({
    spec: 'with {} for an argument: it matches object literals that are empty',
    query: 'foo({})',
    source: `
      + foo({})
        foo({ foo: '1' })
        foo()
    `,
  }),

  matchify({
    spec: 'with { a } for an argument: it matches object literals that define the "a" property',
    query: 'foo({ a })',
    source: `
      + foo({ a: '1' })
      + foo({ a: 1, b: 2 })
        foo({ b: '1' })
    `,
  }),

  matchify({
    spec: 'with { a: Object() } for an argument: it matches object literals that define the "a" property and have a value that is an object',
    query: 'foo({ a: Object() })',
    source: `
      + foo({ a: {} })
      + foo({ a: {}, b: 2 })
        foo({ b: {} })
    `,
  }),

  matchify({
    spec: 'with { a, ?b } it matches object literals that have "a" and maybe have "b"',
    query: 'foo({ a, ?b })',
    source: `
      + foo({ a: 1 })
      + foo({ a: 1, b: 3 })
        foo({ b: 5 }) // NOP, a is required
    `,
  }),

  matchify({
    spec: 'with { ^a } it matches object literals that do not have the "a" property',
    query: 'foo({ ^a })',
    source: `
      + foo({ b: 2 })
      + foo({})
        foo({ a: 1 })
        foo({ a: 1, b: 2, c: 3 })
    `,
  }),

  matchify({
    spec: 'with { a, ^b } it matches object literals that do have the "a" property but not the "b" one',
    query: 'foo({ a, ^b })',
    source: `
      + foo({ a })
        foo({})           // NOP, a is required
        foo({ a, b: 2 })  // NOP, b is there
    `,
  }),

  matchify({
    spec: 'with { a: ^Number() } it matches object literals that do have the "a" property but is not a number',
    query: 'foo({ a: ^Number() })',
    source: `
      + foo({ a: '1' })
      + foo({ a })    // OK, don't know what it is
        foo({ a: 4 })
    `,
  }),
];

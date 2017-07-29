module.exports = [
  {
    spec: 'It matches function calls regardless of arity',
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
];

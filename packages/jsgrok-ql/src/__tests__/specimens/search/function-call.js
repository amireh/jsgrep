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
      { line: 1 },
      { line: 2 },
      { line: 3 },
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
];

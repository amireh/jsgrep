module.exports = [
  {
    only: false,

    query: 'foo().bar()',
    source: `
      foo().bar()
      foo().bar().baz()
      foo().baz()
      foo()
      other().bar()
      bar()
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
    ]
  },

  {
    only: false,

    query: 'foo(String()).bar()',
    source: `
      foo("Hello!").bar()
      foo().bar()
    `.trim(),

    matches: [
      { line: 1 },
    ]
  },

  {
    only: false,

    query: 'foo().bar(String())',
    source: `
      foo().bar("Hello!")
      foo().bar()
    `.trim(),

    matches: [
      { line: 1 },
    ]
  },

  {
    only: false,

    query: 'foo().bar().baz()',
    source: `
      foo().bar().baz()
      foo().bar().bax()
      foo().bar()
      foo()
    `.trim(),

    matches: [
      { line: 1 },
    ]
  },

  {
    only: false,

    query: 'this.bar().baz()',
    source: `
      this.bar().baz()
      this.bar(23).baz()
      this.bar().baz(23)
      foo().bar().bax()
      foo().bar()
      foo()
    `.trim(),

    matches: [
      { line: 1 },
      { line: 2 },
      { line: 3 },
    ]
  },
];

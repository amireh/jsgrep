module.exports = [
  {
    only: false,

    spec: 'member function call bar() on return value of foo() as receiver',
    query: 'foo().bar()',
    source: `
      foo().bar()
      foo().bar().baz()
      foo().baz()
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

    spec: 'member function call bar() on return value of foo() as receiver',
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

    spec: 'member function call bar() on return value of foo() as receiver',
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

    spec: 'member function call bar() on return value of foo() as receiver',
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
];

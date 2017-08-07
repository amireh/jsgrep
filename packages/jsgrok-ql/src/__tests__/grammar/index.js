const { matchify } = require('../utils')

module.exports = [
  // Identifier
  matchify({ query: 'x', source: `[+] x` }),
  matchify({ query: '_', source: `[+] _` }),
  matchify({ query: 'foo', source: `[+] foo` }),
  matchify({ query: '_foo', source: `[+] _foo` }),
  matchify({ query: 'foo_', source: `[+] foo_` }),
  matchify({ query: '_foo_', source: `[+] _foo_` }),
  matchify({ query: 'fooBar', source: `[+] fooBar` }),
  matchify({ query: 'FooBar', source: `[+] FooBar` }),
  matchify({ query: 'FOO_BAR', source: `[+] FOO_BAR` }),

  // AnyLiteral
  // matchify({ query: '*', source: `[+] a` }),
]
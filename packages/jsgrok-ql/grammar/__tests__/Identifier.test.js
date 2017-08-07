const { createTokenTests, builders: b } = require('./utils')

createTokenTests('Identifier', {
  ok: [
    [ 'x', b.identifier('x') ],
    [ '_', b.identifier('_') ],
    [ 'foo', b.identifier('foo') ],
    [ '_foo', b.identifier('_foo') ],
    [ 'foo_', b.identifier('foo_') ],
    [ '_foo_', b.identifier('_foo_') ],
    [ 'fooBar', b.identifier('fooBar') ],
    [ 'FooBar', b.identifier('FooBar') ],
    [ 'FOO_BAR', b.identifier('FOO_BAR') ],
  ],

  notOk: [
    [ '-' ],
    [ '#' ],
  ]
})
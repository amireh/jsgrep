const { createTokenTests } = require('./utils')

createTokenTests('Identifier', {
  ok: [
    [ 'x' ],
    [ '_' ],
    [ 'foo' ],
    [ '_foo' ],
    [ 'foo_' ],
    [ '_foo_' ],
  ],

  notOk: [
    [ '-' ],
    [ '#' ],
  ]
})
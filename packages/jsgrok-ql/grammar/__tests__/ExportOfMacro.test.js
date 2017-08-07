const { createTokenTests } = require('./utils')

createTokenTests('ExportOfMacro', {
  ok: [
    [ ':exportOf(foo)', { source: 'foo', symbol: 'default' } ],
    [ ':exportOf(foo, default)', { source: 'foo', symbol: 'default' } ],
    [ ':exportOf(foo, x)', { source: 'foo', symbol: 'x' } ],
  ]
})

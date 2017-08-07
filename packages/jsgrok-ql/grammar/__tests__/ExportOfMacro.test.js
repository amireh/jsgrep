const { createTokenTests, builders: b } = require('./utils')

createTokenTests('ExportOfMacro', {
  ok: [
    [ ':exportOf(foo)', b.exportOf('foo', 'default') ],
    [ ':exportOf(foo, default)', b.exportOf('foo', 'default') ],
    [ ':exportOf(foo, x)', b.exportOf('foo', 'x') ],
  ]
})

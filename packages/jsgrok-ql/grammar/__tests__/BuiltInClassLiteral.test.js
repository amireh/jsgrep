const { createTokenTests } = require('./utils')

createTokenTests('BuiltInClassLiteral', {
  ok: [
    [ 'String()', 'L_CLASS_STRING' ],
    [ 'Number()', 'L_CLASS_NUMBER' ],
    [ 'RegExp()', 'L_CLASS_REGEXP' ],
    [ 'Object()', 'L_CLASS_OBJECT' ],
  ]
})

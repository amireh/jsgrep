const { createTokenTests } = require('./utils')

createTokenTests('BuiltInClassLiteral', {
  ok: [
    [ ':string', 'L_CLASS_STRING' ],
    [ ':number', 'L_CLASS_NUMBER' ],
    [ ':regexp', 'L_CLASS_REGEXP' ],
    [ ':object', 'L_CLASS_OBJECT' ],
  ]
})

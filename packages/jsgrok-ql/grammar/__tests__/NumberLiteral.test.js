const { createTokenTests, builders: b } = require('./utils')

createTokenTests('NumberLiteral', {
  ok: [
    [ '0', b.number(b.literal(0)) ],
    [ '0.42', b.number(b.literal(0.42)) ],
    [ '12', b.number(b.literal(12)) ],
    [ '12.4', b.number(b.literal(12.4)) ],

    // negatives
    [ '-0.5', b.number(b.literal(-0.5)) ],
    [ '-7', b.number(b.literal(-7)) ],
  ]
})

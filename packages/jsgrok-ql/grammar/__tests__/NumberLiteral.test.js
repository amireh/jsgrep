const { createTokenTests } = require('./utils')

createTokenTests('NumberLiteral', {
  ok: [
    [ '0', 0 ],
    [ '0.42', 0.42 ],
    [ '12', 12 ],
    [ '12.4', 12.4 ],

    // negatives
    [ '-0.5', -0.5 ],
    [ '-7', -7 ],
  ]
})

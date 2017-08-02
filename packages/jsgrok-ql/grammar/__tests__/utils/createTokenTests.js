const { assert } = require('chai');
const createGrammarForToken = require('./createGrammarForToken')
const parseWithGrammar = require('./parseWithGrammar')

const id = x => x;
const evaluate = f => x => {
  if (typeof f === 'function') {
    return f(x);
  }
  else {
    return f;
  }
}

module.exports = (token, { ok = [], notOk = [] }) => {
  describe(`jsgrok-ql::grammar::${token}`, function() {
    const grammar = createGrammarForToken(token)
    const subject = parseWithGrammar(grammar);

    ok.forEach(function([ input, output = id, options = {} ]) {
      const fn = options && options.focus ? it.only : it;

      fn(input, function() {
        const outputFrd = evaluate(output)(input)

        assert.deepEqual(subject(input), outputFrd)
      })
    })

    notOk.forEach(function([ input,, options = {} ]) {
      const fn = options && options.focus ? it.only : it;

      fn(input, function() {
        assert.throws(() => subject(input), "invalid syntax")
      })
    })
  })
}
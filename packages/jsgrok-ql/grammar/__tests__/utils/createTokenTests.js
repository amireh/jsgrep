const { assert } = require('chai');
const createGrammarForToken = require('./createGrammarForToken')
const parseWithGrammar = require('./parseWithGrammar')

const Ignore = {};
const id = x => x;
const evaluate = f => x => {
  if (typeof f === 'function') {
    return f(x);
  }
  else {
    return f;
  }
}

const match = function(spec, output) {
  const { name, props = {} } = spec;

  assert.equal(output[0], name)

  Object.keys(props).forEach(propKey => {
    assert.deepEqual(
      output[1][propKey], props[propKey],
      `Property "${propKey}" mismatch`
    )
  })
}

module.exports = (token, { ok = [], notOk = [] }) => {
  describe(`jsgrok-ql::grammar::${token}`, function() {
    const grammar = createGrammarForToken(token)
    const subject = parseWithGrammar(grammar);

    ok.forEach(function([ input, output = id, options = {} ]) {
      const fn = options && options.focus ? it.only : it;

      fn(input, function() {
        const outputFrd = evaluate(output)(input)
        const result = subject(input);
        if (outputFrd && outputFrd.expressions) {
          outputFrd.expressions.forEach((x,i) => {
            match(x, result)
          })
        }
        else if (outputFrd === Ignore) {
          assert.ok(result)
        }
        else {
          assert.deepEqual(subject(input), outputFrd)
        }
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
module.exports.Ignore = Ignore;
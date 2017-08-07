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

module.exports = (token, { ok = [], notOk = [], only = false }) => {
  const describeFn = only ? describe.only : describe
  describeFn(`jsgrok-ql::grammar::${token}`, function() {
    const grammar = createGrammarForToken(token)
    const subject = parseWithGrammar(grammar);

    ok.forEach(function([ input, output = id, options = {} ]) {
      const fn = options && options.only ? it.only : it;

      fn(input, function() {
        const expected = evaluate(output)(input)
        const actual = subject(input);

        if (expected && expected.expressions) {
          expected.expressions.forEach(x => {
            match(x, actual)
          })
        }
        else if (expected === Ignore) {
          assert.ok(actual)
        }
        else {
          assert.deepEqual(actual, expected, JSON.stringify(actual, null, 4))
        }
      })
    })

    notOk.forEach(function([ input,, options = {} ]) {
      const fn = options && options.only ? it.only : it;

      fn(input, function() {
        assert.throws(() => subject(input), "invalid syntax")
      })
    })
  })
}
module.exports.Ignore = Ignore;
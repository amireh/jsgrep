const { assert } = require('chai');
const { apply } = require('../../')
const path = require('path');
const glob = require('glob')

const createSpecimenTests = f => {
  const groups = glob.sync(path.resolve(__dirname, `./expressions/*.js`)).map(function(filepath) {
    return {
      name: path.basename(filepath).replace('.js', ''),
      specs: require(filepath)
    }
  })

  groups.forEach(({ name, specs }) => {
    describe(name, function() {
      f(specs)
    })
  })
}

describe('jsgrok-ql::eval', function() {
  createSpecimenTests(specs => {
    specs.forEach(function({
      spec = null,
      query: sourceQuery,
      source,
      only,
      matches: expectedMatches
    }) {
      const fn = only ? it.only : it;

      fn(spec || `applies ${sourceQuery}`, function() {
        const results = apply(sourceQuery, source);

        if (expectedMatches) {
          assert(!results.some(x => x.error === true),
            `Some results had errors: ${JSON.stringify(results.filter(x => x.error), null, 4)}`
          )

          assert.equal(expectedMatches.length, results.length,
            `Expected ${expectedMatches.length} match(es), not ${results.length}`
          )

          expectedMatches.forEach((expected, index) => {
            const actual = results[index]

            if (expected.line) {
              assert.equal(expected.line, actual.line,
                `Expected match#${index} to be found on line ${expected.line} ` +
                `but was found on line ${actual.line}`
              )
            }
          })
        }
      });
    })
  })
});
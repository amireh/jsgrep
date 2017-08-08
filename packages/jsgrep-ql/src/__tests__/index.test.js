const { assert } = require('chai');
const { apply } = require('../../')
const path = require('path');
const glob = require('glob')

describe('jsgrep-ql::eval', function() {
  const createSpecimenTests = f => {
    const groups = glob.sync(path.resolve(__dirname, `./{grammar,expressions}/*.js`)).map(function(filepath) {
      return {
        name: path.basename(filepath).replace('.js', ''),
        specs: require(filepath)
      }
    })

    groups.forEach(({ name, specs }) => {
      describe(`[${name}]`, function() {
        f(specs)
      })
    })
  }


  createSpecimenTests(specs => {
    specs.forEach(function({
      spec = null,
      query: sourceQuery,
      source,
      only = false,
      debug = false,
      matches: expectedMatches
    }) {
      const fn = only ? it.only : it;
      const specName = spec ?
        `${spec} { ${sourceQuery} }` :
        `applies { ${sourceQuery} }`
      ;

      fn(specName, function() {
        const results = apply(sourceQuery, source.trim(), null, { debug });
        if (expectedMatches) {
          const sourceLines = source.trim().split('\n');
          const dumpLine = x => `\t\t- line ${x.line} "${sourceLines[x.line-1].trim()}"`
          const dumpDelta = (a, b) => a.filter(expected => {
            return !b.some(x => x.line === expected.line)
          }).map(dumpLine).join('\n')

          assert(!results.some(x => x.error === true),
            `Some results had errors: ${JSON.stringify(results.filter(x => x.error), null, 4)}`
          )

          if (expectedMatches.length > results.length) {
            assert(false,
              `${expectedMatches.length - results.length} missing match(es).
              \n${dumpDelta(expectedMatches, results)}\n`
            )
          }
          else if (expectedMatches.length < results.length) {
            assert(false,
              `${results.length - expectedMatches.length} extraneous match(es).
              \n${dumpDelta(results, expectedMatches)}\n`
            )
          }

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
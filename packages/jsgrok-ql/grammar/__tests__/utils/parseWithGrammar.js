const nearley = require('nearley');
const util = require('util')

module.exports = grammar => input => {
  const parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  const state = parser.feed(input);
  const { results } = state;

  // console.log(`${input} =>\n${util.inspect(results[0][0], {
  //   depth: null,
  //   colors: true
  // })}`)

  if (results && results.length === 1 && results[0].length === 1) {
    return results[0][0]
  }
  else {
    return results;
  }
}
const nearley = require('nearley');
const NEARLEY_PARSE_ERROR = 'nearley: No possible parsings';
const grammar = require('./grammar');

module.exports = input => {
  const parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

  try {
    parser.feed(input);
  }
  catch (e) {
    if (e.message.indexOf(NEARLEY_PARSE_ERROR) === 0) {
      return null;
    }
    else {
      throw e;
    }
  }

  return {
    expressions: parser.results[0] ? parser.results[0][0] : []
  };
};
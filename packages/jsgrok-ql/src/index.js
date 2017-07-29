const parseQuery = require('./parseQuery');
const parseSourceCode = require('./parseSourceCode');
const walkSourceCode = require('./walkSourceCode');
const search = require('./search');

// THIS MUST BE IN SYNC WITH analyzer.cpp
const ERROR_TYPES = {
  SourceCodeError: 1,
  SearchError: 2,
};

exports.apply = function(sourceQuery, sourceCode, filePath) {
  const query = parseQuery(sourceQuery)
  let ast;

  try {
    ast = parseSourceCode(sourceCode.trim());
  }
  catch (e) {
    return [{
      error: true,
      error_type: ERROR_TYPES.SourceCodeError,
      file: filePath,
      message: e.message
    }];
  }

  try {
    return search(walkSourceCode, query, ast);
  }
  catch (e) {
    return [{
      error: true,
      error_type: ERROR_TYPES.SearchError,
      file: filePath,
      message: e.message
    }];
  }
}
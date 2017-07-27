const acorn = require('acorn.js');
const analyze = require('analyze.js');

require('acorn-jsx/index.js')(acorn);

module.exports = function parse(sourceCode, filePath) {
  let ast;

  try {
    ast = acorn.parse(sourceCode, {
      sourceType: 'module',
      locations: true,
      sourceFile: filePath,
      ecmaVersion: 7,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
    })
  }
  catch (e) {
    return [{
      error: true,
      file: filePath,
      message: e.message
    }];
  }

  return analyze(ast);
}


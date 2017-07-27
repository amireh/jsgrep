const acorn = require('acorn.js');
const analyze = require('analyze.js');
const walk = require('walk.js');

require('acorn-jsx/index.js')(acorn, walk);
require('acorn-jsx/walk.js')(walk);

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
      plugins: { jsx: true }
    })
  }
  catch (e) {
    return [{
      error: true,
      file: filePath,
      message: e.message
    }];
  }

  return analyze(walk, ast);
}


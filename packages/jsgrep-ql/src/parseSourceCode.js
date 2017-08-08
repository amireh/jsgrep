const acorn = require('acorn');
const interopRequire = module => module['__esModule'] && module['default'] || module;

interopRequire(require('acorn-jsx/inject.js'))(acorn);
interopRequire(require('acorn-object-spread/inject.js'))(acorn);
interopRequire(require('acorn-static-class-property-initializer/inject.js'))(acorn);
interopRequire(require('acorn-dynamic-import/lib/inject.js'))(acorn);

module.exports = function parseSourceCode(sourceCode) {
  return acorn.parse(sourceCode, {
    sourceType: 'module',
    locations: true,
    ranges: false,
    ecmaVersion: 9,
    allowReturnOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowHashBang: true,
    plugins: {
      jsx: true,
      staticClassPropertyInitializer: true,
      objectSpread: true,
      dynamicImport: true,
    }
  });
}

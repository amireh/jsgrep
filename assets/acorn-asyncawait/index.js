module.exports = function(acorn) {
    acorn.plugins.asyncawait = require('acorn-asyncawait/acorn-v4.js');

    return acorn
}

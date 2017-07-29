const path = require('path');
const glob = require('glob')

module.exports = category => f => {
  const groups = glob.sync(path.resolve(__dirname, `../specimens/${category}/*.js`)).map(function(filepath) {
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
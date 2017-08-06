const { inspect } = require('util')

exports.pipe = function(fns) {
  if (!Array.isArray(fns)) {
    fns = Array.prototype.slice.call(arguments);
  }

  return function() {
    const args = Array.prototype.slice.call(arguments);

    return fns.reduce(function(composite, fn) {
      if (composite === args) {
        return fn.apply(null, args);
      }
      else {
        return fn(composite);
      }
    }, args)
  }
}

exports.partial = (f, x) => f.bind(null, x)

exports.maybe = (p, f, g) => x => {
  if (p) {
    return f(x);
  }
  else {
    return g(x);
  }
}

exports.identity = x => x;

exports.trace = (p, message, format = 'inspect') => x => {
  if (p === true) {
    const value = format === 'json' ?
      JSON.stringify(x, null, 4) :
      inspect(x, { depth: 5, colors: true })
    ;

    console.log(`[DEBUG] ${message}=${value}`)
  }

  return x;
}
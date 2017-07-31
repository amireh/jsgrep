module.exports = x => {
  if (Array.isArray(x) && x.length === 2) {
    return x;
  }
  else if (Array.isArray(x) && x.length === 1) {
    return [ x[0], {} ]
  }
  else {
    return [ x ];
  }
}

module.exports = x => {
  if (typeof x === 'string') {
    return [x, {}];
  }
  else if (Array.isArray(x) && x.length === 1) {
    return [x, {}]
  }
  else {
    return x;
  }
}

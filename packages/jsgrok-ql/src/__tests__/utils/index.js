const stripMatchers = line => line.replace('[+]', '').replace('[ ]', '');
const matchify = x => {
  const sourceLines = x.source.trim().split('\n')
  const matches = x.matches || sourceLines.reduce(function(list, line, index) {
    if (line.match('[+]') && line.trim().indexOf('//') !== 0) {
      return list.concat({ line: index+1 })
    }
    else {
      return list;
    }
  }, [])

  const normalSource = sourceLines.map(stripMatchers).join('\n')

  return Object.assign({}, x, {
    source: normalSource,
    matches
  })
}

matchify.only = x => Object.assign(matchify(x), { only: true })

exports.matchify = matchify;
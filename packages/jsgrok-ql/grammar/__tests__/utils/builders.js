const b = {
  identifier: name => ({ type: 'Identifier', name }),
  literal: value => ({ type: 'Literal', value }),
  anyLiteral: () => ({ type: 'AnyLiteral' }),
  nullLiteral: () => ({ type: 'NullLiteral' }),
  thisLiteral: () => ({ type: 'ThisLiteral' }),
  voidLiteral: () => ({ type: 'VoidLiteral' }),
  string: value => ({ type: 'String', value }),
  number: value => ({ type: 'Number', value }),
  regexp: ({ pattern }) => ({ type: 'RegExp', pattern }),
  object: ({ keys = [], properties = [] }) => ({ type: 'Object', keys, properties }),
  flags: flags => x => Object.assign(flags, x),

  exportOf: (source, symbol) => ({
    type: 'ExportOfMacroExpression',
    source,
    symbol,
  })
}

module.exports = b
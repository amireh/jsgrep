@builtin "whitespace.ne"

@{%
  const RESERVED_IDENTIFIERS = {
    'void': true,
    'this': true,
    'null': true,
  }
  const always = x => () => x;
  const assoc = (x, k, v) => {
    x[k] = v;
    return x;
  };

  const literalOf = value => ({ type: 'Literal', value })
  const builtInClassOf = name => ({ type: 'BuiltInClass', name })

  const trimString = x => x.trim()

  const FLAGS = {
    '?': 'F_OPT',
    '^': 'F_NOT',
  }

  const createValueFlagPair = (flag, value) => {
    if (flag === '?') {
      return Object.assign({}, value, { optional: true })
    }
    else if (flag === '^') {
      return Object.assign({}, value, { negated: true })
    }
    else {
      return value
    }
  }

  const O_EVAL = 'O_EVAL'
  const O_PRODUCT = 'O_PRODUCT'
  const O_TERMINATE = 'O_TERMINATE'
  const evalExpr = x => ({ type: O_EVAL, expr: x })

  const L_ANY = { type: 'AnyLiteral' }
%}

Query ->
    Query _ "." _ Expression {% d => ({
        type: O_PRODUCT,
        lhs: d[0],
        rhs: evalExpr(d[4])
      })
    %}
  | Expression {% d => ({
    type: O_TERMINATE,
    expr: evalExpr(d[0])
  }) %}

Expression ->
    Receiver {% id %}
  | ExportOfMacro {% id %}
  | FunctionCallExpression {% id %}

FunctionCallExpression ->
  (
      Identifier {% id %}
    | ExportOfMacro {% id %}
  )
  "(" _
    (
      FunctionTypeExpression {% id %} |
      VoidLiteral {% id %}
    ):?
  _ ")"

  {%
    ([ id,,, arguments = [] ]) => (
      ['function-call', {
        id,
        arguments: [].concat(arguments || [])
      }]
    )
  %}

FunctionTypeExpression ->
    TypeExpression
  | FunctionTypeExpression _ "," _ TypeExpression
    {%
      (d, loc) => {
        return d[0].concat(d[4])
      }
    %}


TypeExpression ->
    BuiltInClassLiteral {% id %}
  | NumberLiteral {% id %}
  | StringLiteral {% id %}
  | RegExpLiteral {% id %}
  | ObjectLiteral {% id %}
  | AnyLiteral {% id %}
  | Identifier {% id %}

Receiver ->
    ThisLiteral {% id %}
  | AnyLiteral {% id %}
  | GreedyAnyLiteral {% id %}
  | Identifier {% id %}

Identifier -> [a-zA-Z_] [a-zA-Z0-9_]:*
  {%
    ([ leadingChar, rest ], loc, reject) => {
      const id = leadingChar + rest.join('');

      if (RESERVED_IDENTIFIERS[id]) {
        // throw new Error(`reserved keyword "${id}" may not appear as an identifier`);
        return reject;
      }
      else {
        return { type: 'Identifier', name: id }
      }
    }
  %}

BuiltInClassLiteral ->
    ":string" {% always({ type: 'String', value: L_ANY }) %}
  | ":number" {% always({ type: 'Number', value: L_ANY }) %}
  | ":regexp" {% always({ type: 'RegExp', pattern: L_ANY }) %}
  | ":object" {% always({ type: 'Object', keys: null, properties: null }) %}

AnyLiteral        -> "*"              {% always(L_ANY) %}
GreedyAnyLiteral  -> "**"             {% always({ type: 'GreedyAnyLiteral' }) %}
VoidLiteral       -> "void"           {% always({ type: 'VoidLiteral' }) %}
ThisLiteral       -> "this"           {% always({ type: 'ThisLiteral' }) %}
NullLiteral       -> "null"           {% always({ type: 'NullLiteral' }) %}
RegExpLiteral     -> "/" [^\/]:+ "/"  {% d => ({
  type: 'RegExp',
  pattern: literalOf(d[1].join(''))
}) %}

ExportOfMacro ->
  ":exportOf(" _ ExportOfSpecifier _ ")" {% d => ({
    type: 'ExportOfMacroExpression',
    source: d[2][0],
    symbol: d[2][1]
  }) %}

ExportOfSpecifier ->
  [^)]:+ {% d => {
    const [ source, symbol = "default" ] = d[0].join('').split(',').map(trimString)
    return [ source, symbol ]
  }
%}

# yes this may produce garbage (e.g. 1.2.1) but whoever does that deserves what
# they get
NumberLiteral -> "-":? [\.0-9]:+ {% d => ({
  type: 'Number',
  value: literalOf(parseFloat((d[0] || '') + d[1].join('')))
}) %}

StringLiteral ->
  StringQuoteLiteral _
    NotAQuote:*
  _ StringQuoteLiteral
  {% d => ({ type: 'String', value: literalOf(d[2].join('')) }) %}

StringQuoteLiteral -> Quote

ObjectLiteral ->
    EmptyObjectLiteral {%
      always({ type: 'Object', keys: [], properties: [] })
    %}

  | "{" _ ObjectPropertyList _ "}" {%
    d => ({ type: 'Object', keys: Object.keys(d[2]), properties: d[2] })
  %}

EmptyObjectLiteral -> "{" _ "}"

ObjectPropertyList ->
    ObjectProperty {% id %}
  | ObjectPropertyList _  "," _ ObjectProperty {% d => Object.assign({}, d[0], d[4]) %}

ObjectProperty ->
    ObjectPropertyFlag:? ObjectKey _ ":" _ ObjectValue {% d => assoc({}, d[1], createValueFlagPair(d[0], d[5])) %}
  | ObjectPropertyFlag:? ObjectKey                     {% d => assoc({}, d[1], createValueFlagPair(d[0], { type: 'AnyLiteral' })) %}

ObjectKey -> Identifier {% d => d[0].name %}
ObjectValue ->
    ObjectPropertyFlag:? BuiltInClassLiteral  {% d => createValueFlagPair(d[0], d[1]) %}
  | ObjectPropertyFlag:? AnyLiteral           {% d => createValueFlagPair(d[0], d[1]) %}
  | ObjectPropertyFlag:? NumberLiteral        {% d => createValueFlagPair(d[0], d[1]) %}
  | ObjectPropertyFlag:? StringLiteral        {% d => createValueFlagPair(d[0], d[1]) %}
  | ObjectPropertyFlag:? RegExpLiteral        {% d => createValueFlagPair(d[0], d[1]) %}
  | ObjectPropertyFlag:? NullLiteral          {% d => createValueFlagPair(d[0], d[1]) %}

ObjectPropertyFlag -> [\?\^] {% id %}

Quote -> [\"\'] {% always(null) %}
NotAQuote -> [^\"\']
NotAClosingParenthesis -> [^)]
@builtin "whitespace.ne"

@{%
  const RESERVED_IDENTIFIERS = {
    'void': true,
    'this': true,
    'null': true,
  }

  const FLAGS = {
    '?': 'F_OPT',
    '^': 'F_NOT',
  }

  const O_EVAL = 'O_EVAL'
  const O_PRODUCT = 'O_PRODUCT'
  const O_TERMINATE = 'O_TERMINATE'
  const L_ANY = { type: 'AnyLiteral' }

  const always = x => () => x;
  const literalOf = value => ({ type: 'Literal', value })
  const trimString = x => x.trim()
  const constantizeFlag = d => FLAGS[d[0]]
  const evalExpr = x => ({ type: O_EVAL, expr: x })

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
  {% d => ({
    type: 'FunctionCall',
    id: d[0],
    arguments: [].concat(d[3] || [])
  }) %}

FunctionTypeExpression ->
    NegatableTypeExpression
  | FunctionTypeExpression _ "," _ NegatableTypeExpression
    {%
      (d, loc) => {
        return d[0].concat(d[4])
      }
    %}

NegatableTypeExpression ->
  [\^]:? TypeExpression {% d => Object.assign(d[1], { negated: d[0] === '^' }) %}

TypeExpression ->
    BuiltInClassLiteral {% id %}
  | NumberLiteral {% id %}
  | StringLiteral {% id %}
  | RegExpLiteral {% id %}
  | ObjectLiteral {% id %}
  | AnyLiteral {% id %}
  | Identifier {% id %}

Receiver ->
    ThisLiteral {% d => ({ type: 'Identifier', name: 'L_THIS' }) %}
  | AnyLiteral {% d => ({ type: 'Identifier', name: 'L_ANY' }) %}
  | GreedyAnyLiteral {% d => ({ type: 'Identifier', name: 'L_ANY_GREEDY' }) %}
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
  | ":object" {% always({ type: 'Object', properties: null }) %}

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
    type: 'ImportedIdentifier',
    macro: true,
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
      always({ type: 'Object', properties: [] })
    %}

  | "{" _ ObjectPropertyList _ "}" {%
    d => ({ type: 'Object', properties: d[2] })
  %}

EmptyObjectLiteral -> "{" _ "}"

ObjectPropertyList ->
    ObjectProperty
  | ObjectPropertyList _  "," _ ObjectProperty {% d => [].concat(d[0]).concat(d[4]) %}

ObjectProperty ->
    ObjectPropertyFlag:? ObjectKey _ ":" _ ObjectValue {% d => ({
      type: 'Property',
      key: d[1],
      keyFlag: d[0],
      value: d[5][1],
      valueFlag: d[5][0],
    })
  %}

  | ObjectPropertyFlag:? ObjectKey {% d => ({
      type: 'Property',
      key: d[1],
      keyFlag: d[0],
      value: L_ANY,
      valueFlag: null
    }) %}

ObjectKey -> Identifier {% d => d[0].name %}
ObjectValue ->
    ObjectPropertyFlag:? BuiltInClassLiteral  {% d => d %}
  | ObjectPropertyFlag:? AnyLiteral           {% d => d %}
  | ObjectPropertyFlag:? NumberLiteral        {% d => d %}
  | ObjectPropertyFlag:? StringLiteral        {% d => d %}
  | ObjectPropertyFlag:? RegExpLiteral        {% d => d %}
  | ObjectPropertyFlag:? NullLiteral          {% d => d %}

ObjectPropertyFlag -> [\?\^] {% constantizeFlag %}

Quote -> [\"\'] {% always(null) %}
NotAQuote -> [^\"\']
NotAClosingParenthesis -> [^)]
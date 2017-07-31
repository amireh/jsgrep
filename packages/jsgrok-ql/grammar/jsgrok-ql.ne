@builtin "whitespace.ne"

@{%
  const RESERVED_IDENTIFIERS = {
    'void': true,
    'this': true,
    'null': true,
  }
  const always = x => () => x;
  const reject = (d, loc, reject) => reject;
  const asArray = f => x => Array(f(x));
  const collectString = d => d[0].join('');
  const assoc = (x, k, v) => {
    x[k] = v;
    return x;
  };

  const FLAGS = {
    '?': 'F_OPT',
    '^': 'F_NOT'
  }

  const createObjectValuePair = (flag, value) => {
    if (flag) {
      return [ value, FLAGS[flag] ]
    }
    else {
      return value
    }
  }
%}

Query -> Expression
Expression -> FunctionCallExpression

FunctionCallExpression ->
  MemberExpression:? Identifier
  "(" _
    (
      FunctionTypeExpression {% id %} |
      VoidLiteral {% id %}
    ):?
  _ ")"

  {%
    ([ receiver, id,,, arguments = [] ]) => (
      ['function-call', {
        id,
        arguments: [].concat(arguments || []),
        receiver
      }]
    )
  %}

MemberExpression -> Receiver "." {% id %}

FunctionTypeExpression ->
    TypeExpression
  | FunctionTypeExpression _ "," _ TypeExpression
    {%
      (d, loc) => {
        return d[0].concat(d[4])
      }
    %}


# - Identifiers: a, foo, bar
TypeExpression ->
    BuiltInClassLiteral {% id %}
  | AnyLiteral {% id %}
  | NumberLiteral {% id %}
  | StringLiteral {% id %}
  | RegExpLiteral {% id %}
  | ObjectLiteral {% id %}
  | Identifier {% id %}

Receiver ->
    AnyLiteral {% id %}
  | ThisLiteral {% id %}
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
        return id;
      }
    }
  %}

BuiltInClassLiteral ->
    "String()" {% always('L_CLASS_STRING') %}
  | "Number()" {% always('L_CLASS_NUMBER') %}
  | "RegExp()" {% always('L_CLASS_REGEXP') %}
  | "Object()" {% always('L_CLASS_OBJECT') %}

AnyLiteral -> "*" {% always('L_ANY') %}
VoidLiteral -> "void" {% always('L_VOID') %}
ThisLiteral -> "this" {% always('L_THIS') %}
NullLiteral -> "null" {% always('L_NULL') %}
RegExpLiteral -> "/" [^\/]:+ "/" {% d => ({ regexp: d[1].join('') }) %}

# yes this may produce garbage (e.g. 1.2.1) but whoever does that deserves what
# they get
NumberLiteral -> "-":? [\.0-9]:+ {% d => parseFloat((d[0] || '') + d[1].join('')) %}

StringLiteral ->
  StringQuoteLiteral _
    NotAQuote:*
  _ StringQuoteLiteral
  {% d => d[2].join('') %}

StringQuoteLiteral -> Quote

ObjectLiteral ->
    EmptyObjectLiteral {% always('L_EMPTY_OBJECT') %}
  | "{" _ ObjectPropertyList _ "}"
    {% d => ({ object: { keys: Object.keys(d[2]), properties: d[2] } }) %}

ObjectPropertyList ->
    ObjectProperty {% id %}
  | ObjectPropertyList _  "," _ ObjectProperty {% d => Object.assign({}, d[0], d[4]) %}

ObjectProperty ->
    ObjectPropertyFlag:? ObjectKey _ ":" _ ObjectValue {% d => assoc({}, d[1], createObjectValuePair(d[0], d[5])) %}
  | ObjectPropertyFlag:? ObjectKey                     {% d => assoc({}, d[1], createObjectValuePair(d[0], 'L_ANY')) %}

ObjectKey -> Identifier {% id %}
ObjectPropertyFlag -> [\?\^] {% id %}
ObjectValue ->
    BuiltInClassLiteral {% id %}
  | AnyLiteral {% id %}
  | NumberLiteral {% id %}
  | StringLiteral {% id %}
  | RegExpLiteral {% id %}
  | NullLiteral   {% id %}

EmptyObjectLiteral -> "{" _ "}" {% always('L_EMPTY_OBJECT') %}

Quote -> [\"\'] {% always(null) %}
NotAQuote -> [^\"\']
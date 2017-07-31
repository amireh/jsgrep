@builtin "whitespace.ne"

@{%
  const RESERVED_IDENTIFIERS = {
    'void': true,
    'this': true,
    'null': true,
  }
  const L_ANY = 'L_ANY';
  const L_VOID = 'L_VOID';
  const L_THIS = 'L_THIS';
  const always = x => () => x;
  const reject = (d, loc, reject) => reject;
  const asArray = f => x => Array(f(x));
  const collectString = d => d[0].join('');
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
    "String()" {% d => 'L_CLASS_STRING' %}
  | "Number()" {% d => 'L_CLASS_NUMBER' %}

AnyLiteral -> "*" {% always(L_ANY) %}
VoidLiteral -> "void" {% always(L_VOID) %}
ThisLiteral -> "this" {% always(L_THIS) %}
StringLiteral ->
  StringQuoteLiteral _
    [^\"\']:*
  _ StringQuoteLiteral
  {% d => d[2].join('') %}

StringQuoteLiteral -> [\"\'] {% always(null) %}

# yes this may produce garbage (e.g. 1.2.1) but whoever does that deserves what
# they get
NumberLiteral -> "-":? [\.0-9]:+ {% d => parseFloat((d[0] || '') + d[1].join('')) %}

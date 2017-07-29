@{%
  const RETURN_NULL = () => null;
  const RESERVED_IDENTIFIERS = {
    'void': true,
    'this': true,
    'null': true,
  }
%}

Main -> Expression
Expression -> FunctionCallExpression

FunctionCallExpression ->
  MemberExpression:? Identifier "(" _ FunctionTypeExpression:? _ ")"
  {%
    d => (
      ['function-call', {
        id: d[1],
        arguments: d[4] || [],
        receiver: d[0]
      }]
    )
  %}

MemberExpression -> Receiver "."
  {%
    d => d[0]
  %}

# TODO: multiple arguments delimited by ,
FunctionTypeExpression -> VoidLiteral | TypeExpression

# - Identifiers: a, foo, bar
TypeExpression -> [a-z]

Receiver -> (AnyLiteral | ThisLiteral | Identifier)
  {%
    d => d[0][0]
  %}

Identifier -> [a-zA-Z_] [a-zA-Z_1-9]:+
  {%
    ([ leadingChar, rest ], loc, reject) => {
      const id = leadingChar + rest.join('');

      if (RESERVED_IDENTIFIERS[id]) {
        return reject;// (`reserved keyword "${id}" may not appear as an identifier`);
      }

      return id;
    }
  %}

AnyLiteral -> "*" {% () => 'L_ANY' %}
VoidLiteral -> "void" {% () => 'L_VOID' %}
ThisLiteral -> "this" {% () => 'L_THIS' %}

_ -> [\s]:*     {% RETURN_NULL %}

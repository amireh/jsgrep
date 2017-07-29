@{%
  const RETURN_NULL = () => null;
%}

Main -> Expression
Expression -> FunctionExpression
FunctionExpression ->
  Identifier "(" _ FunctionTypeExpression:? _ ")"
  {%
    d => (
      ['function-call', {
        id: d[0],
        arguments: d[3] || []
      }]
    )
  %}

# TODO: multiple arguments delimited by ,
FunctionTypeExpression -> VoidLiteral | TypeExpression

# - Identifiers: a, foo, bar
TypeExpression -> [a-z]

Identifier -> [a-zA-Z_] [a-zA-Z_1-9]:+
  {%
    ([ leadingChar, rest ]) => leadingChar + rest.join('')
  %}

VoidLiteral -> "void"
  {%
    () => 'void-literal'
  %}

_ -> [\s]:*     {% RETURN_NULL %}

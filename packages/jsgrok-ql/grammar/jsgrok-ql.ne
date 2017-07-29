@{%
  const RETURN_NULL = () => null;
%}

Main -> Expression
Expression -> FunctionExpression
FunctionExpression ->
  FunctionIdentifier "(" _ FunctionTypeExpression:? _ ")"
  {%
    d => (
      ['function-call', {
        id: d[0],
        arguments: d[3] || []
      }]
    )
  %}

FunctionIdentifier -> [a-z]:+
  {%
    d => d[0].join('')
  %}

# TODO: multiple arguments delimited by ,
FunctionTypeExpression -> VoidLiteral | TypeExpression

# - Identifiers: a, foo, bar
TypeExpression -> [a-z]

VoidLiteral -> "void"
  {%
    () => 'void-literal'
  %}

_ -> [\s]:*     {% RETURN_NULL %}

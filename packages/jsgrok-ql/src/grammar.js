// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

  const RETURN_NULL = () => null;
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "Main", "symbols": ["Expression"]},
    {"name": "Expression", "symbols": ["FunctionExpression"]},
    {"name": "FunctionExpression$ebnf$1", "symbols": ["FunctionTypeExpression"], "postprocess": id},
    {"name": "FunctionExpression$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "FunctionExpression", "symbols": ["Identifier", {"literal":"("}, "_", "FunctionExpression$ebnf$1", "_", {"literal":")"}], "postprocess": 
        d => (
          ['function-call', {
            id: d[0],
            arguments: d[3] || []
          }]
        )
          },
    {"name": "FunctionTypeExpression", "symbols": ["VoidLiteral"]},
    {"name": "FunctionTypeExpression", "symbols": ["TypeExpression"]},
    {"name": "TypeExpression", "symbols": [/[a-z]/]},
    {"name": "Identifier$ebnf$1", "symbols": [/[a-zA-Z_1-9]/]},
    {"name": "Identifier$ebnf$1", "symbols": ["Identifier$ebnf$1", /[a-zA-Z_1-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Identifier", "symbols": [/[a-zA-Z_]/, "Identifier$ebnf$1"], "postprocess": 
        ([ leadingChar, rest ]) => leadingChar + rest.join('')
          },
    {"name": "VoidLiteral$string$1", "symbols": [{"literal":"v"}, {"literal":"o"}, {"literal":"i"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "VoidLiteral", "symbols": ["VoidLiteral$string$1"], "postprocess": 
        () => 'void-literal'
          },
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": RETURN_NULL}
]
  , ParserStart: "Main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();

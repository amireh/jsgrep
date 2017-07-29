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
    {"name": "FunctionExpression", "symbols": ["FunctionIdentifier", {"literal":"("}, "_", "FunctionExpression$ebnf$1", "_", {"literal":")"}], "postprocess": 
        d => (
          ['function-call', {
            id: d[0],
            arguments: d[3] || []
          }]
        )
          },
    {"name": "FunctionIdentifier$ebnf$1", "symbols": [/[a-z]/]},
    {"name": "FunctionIdentifier$ebnf$1", "symbols": ["FunctionIdentifier$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "FunctionIdentifier", "symbols": ["FunctionIdentifier$ebnf$1"], "postprocess": 
        d => d[0].join('')
          },
    {"name": "FunctionTypeExpression", "symbols": ["VoidLiteral"]},
    {"name": "FunctionTypeExpression", "symbols": ["TypeExpression"]},
    {"name": "TypeExpression", "symbols": [/[a-z]/]},
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

// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

  const RETURN_NULL = () => null;
  const RESERVED_IDENTIFIERS = {
    'void': true,
    'this': true,
    'null': true,
  }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "Main", "symbols": ["Expression"]},
    {"name": "Expression", "symbols": ["FunctionCallExpression"]},
    {"name": "FunctionCallExpression$ebnf$1", "symbols": ["MemberExpression"], "postprocess": id},
    {"name": "FunctionCallExpression$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "FunctionCallExpression$ebnf$2", "symbols": ["FunctionTypeExpression"], "postprocess": id},
    {"name": "FunctionCallExpression$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "FunctionCallExpression", "symbols": ["FunctionCallExpression$ebnf$1", "Identifier", {"literal":"("}, "_", "FunctionCallExpression$ebnf$2", "_", {"literal":")"}], "postprocess": 
        d => (
          ['function-call', {
            id: d[1],
            arguments: d[4] || [],
            receiver: d[0]
          }]
        )
          },
    {"name": "MemberExpression", "symbols": ["Receiver", {"literal":"."}], "postprocess": 
        d => d[0]
          },
    {"name": "FunctionTypeExpression", "symbols": ["VoidLiteral"]},
    {"name": "FunctionTypeExpression", "symbols": ["TypeExpression"]},
    {"name": "TypeExpression", "symbols": [/[a-z]/]},
    {"name": "Receiver$subexpression$1", "symbols": ["AnyLiteral"]},
    {"name": "Receiver$subexpression$1", "symbols": ["ThisLiteral"]},
    {"name": "Receiver$subexpression$1", "symbols": ["Identifier"]},
    {"name": "Receiver", "symbols": ["Receiver$subexpression$1"], "postprocess": 
        d => d[0][0]
          },
    {"name": "Identifier$ebnf$1", "symbols": [/[a-zA-Z_1-9]/]},
    {"name": "Identifier$ebnf$1", "symbols": ["Identifier$ebnf$1", /[a-zA-Z_1-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Identifier", "symbols": [/[a-zA-Z_]/, "Identifier$ebnf$1"], "postprocess": 
        ([ leadingChar, rest ], loc, reject) => {
          const id = leadingChar + rest.join('');
        
          if (RESERVED_IDENTIFIERS[id]) {
            return reject;// (`reserved keyword "${id}" may not appear as an identifier`);
          }
        
          return id;
        }
          },
    {"name": "AnyLiteral", "symbols": [{"literal":"*"}], "postprocess": () => 'L_ANY'},
    {"name": "VoidLiteral$string$1", "symbols": [{"literal":"v"}, {"literal":"o"}, {"literal":"i"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "VoidLiteral", "symbols": ["VoidLiteral$string$1"], "postprocess": () => 'L_VOID'},
    {"name": "ThisLiteral$string$1", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"i"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ThisLiteral", "symbols": ["ThisLiteral$string$1"], "postprocess": () => 'L_THIS'},
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

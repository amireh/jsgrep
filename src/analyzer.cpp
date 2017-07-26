#include <algorithm>
#include "jsgrok/analyzer.hpp"
#include "jsgrok/v8_session.hpp"
#include <assert.h>

namespace jsgrok {
  using namespace v8;
  using std::any_of;

  analyzer::analyzer() {
  }

  analyzer::~analyzer() {
  }

  analyzer::analysis_t analyzer::apply(jsgrok::v8_session *session, string_t const& source_code) {
    const int ANALYZER_COUNT = 2;
    analysis_t results;

    Isolate *isolate = session->get_isolate();
    // Isolate::Scope isolate_scope(isolate);

    auto create_key = [&](const char* key) -> Local<String> {
      return String::NewFromUtf8(isolate, key);
    };

    // Create a stack-allocated handle scope.
    HandleScope handle_scope(isolate);

    // Create a new context.
    Local<Context> context = Context::New(isolate);

    // Enter the context for compiling and running the hello world script.
    Context::Scope context_scope(context);

    Handle<Object> exports = session->require("deps/acorn.js");

    std::vector<Handle<Object>> analyzer_modules = {
      session->require("src/analyzers/call.js"),
      session->require("src/analyzers/objectProperty.js"),
    };

    if (any_of(analyzer_modules.begin(), analyzer_modules.end(), [&](Handle<Object> x) {
      return x->Has(context, create_key("default")).ToChecked() == false;
    })) {
      printf("some analyzer didn't export a default function!\n");
      return results;
    }

    Handle<Object> call_analyzer_exports = session->require("src/analyzers/call.js");

    assert(exports.IsObject());

    // MaybeLocal<Value> parse_fn_prop = exports->Get(context, create_key("parse"));
    auto parse_value = session->get(exports, "parse");

    if (parse_value.IsEmpty()) {
      return results;
    }

    std::vector<Local<Function>> analyzers;

    for (auto x : analyzer_modules) {
      auto default_fn = session->get(x, "default");

      if (!default_fn.IsEmpty()) {
        analyzers.push_back(Local<Function>::Cast(default_fn));
      }
    }

    auto parse = Local<Function>::Cast(parse_value);

    Local<Value> args[] = {
      String::NewFromUtf8(isolate, source_code.c_str()),
      Null(isolate),
    };

    MaybeLocal<Value> ast_ref = parse->Call(context, exports, 2, args);

    if (ast_ref.IsEmpty()) {
      return results;
    }

    Local<Value> ast = ast_ref.ToLocalChecked();

    if (!ast->IsObject()) {
      return results;
    }

    Local<Value> call_argv[] = { ast };
    const int call_argc = 1;

    for (auto call : analyzers) {
      auto result = call->Call(context, call_analyzer_exports, call_argc, call_argv);

      if (!result.IsEmpty()) {
        results.push_back(result.ToLocalChecked());
      }
    }

    return results;
  }
}
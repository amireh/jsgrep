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

  analyzer::analysis_t analyzer::apply(v8_session *session, string_t const& source_code) {
    analysis_t results;

    Isolate *isolate = session->get_isolate();
    // Isolate::Scope isolate_scope(isolate);

    // Create a stack-allocated handle scope.
    HandleScope handle_scope(isolate);

    // Create a new context.
    Local<Context> context = Context::New(isolate);
    Context::Scope context_scope(context);

    Local<Object> global = context->Global();

    require_context_t require_context({
      session,
      &context
    });

    // PREPARE CONTEXT:
    define_require(session, context, &require_context);

    // Enter the context for compiling and running the hello world script.

    // Handle<Object> exports = session->require("deps/acorn.js");
    session->require(context, "deps/acorn.js");
    session->require(context, "deps/walk.js");

    auto acorn_ref = session->get(context, global, "acorn");

    if (acorn_ref.IsEmpty()) {
      printf("Unable to find 'acorn' global!\n");
      return results;
    }

    auto exports = acorn_ref->ToObject();
    auto analyze_exports = session->require(context, "src/analyze.js");

    assert(exports.IsObject());
    assert(analyze_exports.IsObject());

    auto parse_ref = session->get(context, exports, "parse");

    if (parse_ref.IsEmpty()) {
      printf("Unable to find acorn.parse!\n");
      return results;
    }

    auto parse = Local<Function>::Cast(parse_ref);

    Local<Function> analyze = Local<Function>::Cast(
      session->get(context, analyze_exports, "default")
    );

    if (analyze.IsEmpty()) {
      printf("Unable to find analyze.js default export!\n");
      return results;
    }

    Local<Value> args[] = {
      String::NewFromUtf8(isolate, source_code.c_str()),
      Null(isolate),
    };

    MaybeLocal<Value> ast_ref = parse->Call(context, exports, 2, args);

    if (ast_ref.IsEmpty()) {
      printf("Unable to generate AST!\n");
      return results;
    }

    Local<Value> ast = ast_ref.ToLocalChecked();

    if (!ast->IsObject()) {
      printf("Unable to generate AST!\n");
      return results;
    }

    auto result = analyze->Call(context, analyze_exports, 1, &ast);

    if (!result.IsEmpty()) {
      results.push_back(result.ToLocalChecked());
    }

    return aggregate_results(context, results);
  }

  analyzer::analysis_t analyzer::aggregate_results(Local<Context> &context, analysis_t const& in) const {
    analysis_t out;

    for (auto result : in) {
      if ((*result)->IsArray()) {
        auto result_list = v8::Array::Cast(*result);
        auto result_item_count = result_list->Length();

        for (uint32_t i = 0; i < result_item_count; ++i) {
          auto result_item = result_list->Get(context, i);

          if (!result_item.IsEmpty()) {
            out.push_back(result_item.ToLocalChecked());
          }
        }
      }
      else {
        out.push_back(result);
      }
    }

    return out;
  }

  void analyzer::define_require(v8_session *session, Local<Context> &context, require_context_t *require_context) {
    Isolate *isolate = session->get_isolate();

    Local<Object>            global = context->Global();
    Local<FunctionTemplate>  require_tmpl = FunctionTemplate::New(
      isolate,
      &analyzer::require,
      External::New(isolate, require_context)
    );

    global->Set(context, String::NewFromUtf8(isolate, "require"), require_tmpl->GetFunction());
  }

  void analyzer::require(const v8::FunctionCallbackInfo<Value> &args) {
    if (args.Length() == 1) {
      auto require_context = (require_context_t*)External::Cast(*args.Data())->Value();
      auto session = require_context->session;
      auto context = require_context->context;
      auto exports = session->require(*context, *String::Utf8Value(args[0]->ToString()));

      args.GetReturnValue().Set(exports);
    }
    else {
      args.GetReturnValue().SetUndefined();
    }
  }
}
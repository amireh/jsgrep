#include <algorithm>
#include "jsgrok/analyzer.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/fs.hpp"

namespace jsgrok {
  using namespace v8;
  using std::any_of;

  analyzer::analyzer() {
  }

  analyzer::~analyzer() {
  }

  analyzer::analysis_t analyzer::apply(v8_session *session, string_t const& filepath, string_t const& source_code) {
    Isolate *isolate = session->get_isolate();
    js_analysis_t js_results;
    analysis_t results;
    jsgrok::fs fs;

    HandleScope handle_scope(isolate);
    Local<Context> context = Context::New(isolate);
    Context::Scope context_scope(context);

    Local<Object> global = context->Global();

    require_context_t require_context({
      session,
      &context
    });

    define_require(session, context, &require_context);

    auto parse_module = session->require(context, "assets/parse.js");

    if (!parse_module || !parse_module.exports->IsObject()) {
      printf("Unable to require 'parse.js'!\n");
      return results;
    }

    auto parse_exports = parse_module.exports->ToObject();

    auto parse = Local<Function>::Cast(
      session->get(context, parse_exports, "default")
    );

    Local<Value> args[] = {
      String::NewFromUtf8(isolate, source_code.c_str()),
      String::NewFromUtf8(isolate, filepath.c_str()),
    };

    auto result = parse->Call(context, parse_exports, 2, args);

    if (!result.IsEmpty()) {
      js_results.push_back(result.ToLocalChecked());
    }

    return cast_down(
      session,
      context,
      filepath,
      aggregate_results(
        context,
        js_results
      )
    );
  }

  analyzer::js_analysis_t analyzer::aggregate_results(
    Local<Context> &context,
    js_analysis_t const& in
  ) const {
    js_analysis_t out;

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

  analyzer::analysis_t analyzer::cast_down(
    v8_session *session,
    Local<Context> &context,
    string_t const& filepath,
    js_analysis_t const& in
  ) const {
    Isolate *isolate = session->get_isolate();
    analysis_t out;

    auto prop = [&](Local<Object> object, const char* key) -> Local<Value> {
      return object->Get(context, String::NewFromUtf8(isolate, key)).ToLocalChecked();
    };

    auto read_string = [&](Local<Object> object, const char* key) -> string_t {
      return *String::Utf8Value(prop(object, key)->ToString());
    };

    for (auto result : in) {
      if (result.IsEmpty()) {
        continue;
      }
      else if (result->IsObject()) {
        auto object = result->ToObject();
        auto is_error = object->Has(context, String::NewFromUtf8(isolate, "error"));

        if (!is_error.IsNothing() && is_error.ToChecked()) {
          out.errors.push_back({ filepath, read_string(object, "message") });
        }
        else {
          analysis_match_t match;
          match.file = filepath;
          match.match = read_string(object, "match");
          match.line = prop(object, "line")->ToUint32()->Value();
          match.start = prop(object, "start")->ToUint32()->Value();
          match.end = prop(object, "end")->ToUint32()->Value();

          out.matches.push_back(match);
        }
      }
      else {
        printf("Don't know how to handle results of this type, yo\n");
      }
    }

    return out;
  }

  void analyzer::define_require(
    v8_session *session,
    Local<Context> &context,
    require_context_t *require_context
  ) {
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
      auto fs = jsgrok::fs();
      auto require_context = (require_context_t*)External::Cast(*args.Data())->Value();
      auto session = require_context->session;
      auto context = require_context->context;
      auto module_path = fs.resolve_asset(*String::Utf8Value(args[0]->ToString()));
      auto module  = session->require(*context, module_path);

      if (!module) {
        args.GetReturnValue().SetUndefined();
      }
      else {
        args.GetReturnValue().Set(module.exports);
      }
    }
    else {
      args.GetReturnValue().SetUndefined();
    }
  }
}
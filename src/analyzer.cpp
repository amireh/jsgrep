#include <algorithm>
#include "jsgrok/analyzer.hpp"
#include "jsgrok/v8_nodejs_context.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/fs.hpp"

extern unsigned char jsgrok_ql_js[];
extern unsigned int jsgrok_ql_js_len;

namespace jsgrok {
  using namespace v8;
  using std::any_of;
  using jsgrok::v8_nodejs_context;

  analyzer::analyzer() {
  }

  analyzer::~analyzer() {
  }

  analyzer::analysis_t analyzer::apply(v8_session *session, string_t const& query, vector<string_t> const &filepaths) const {
    Isolate *isolate = session->get_isolate();
    js_analysis_t js_results;
    analysis_t results;
    jsgrok::fs fs;

    HandleScope handle_scope(isolate);
    Local<Context> context = Context::New(isolate);
    Context::Scope context_scope(context);

    v8_nodejs_context::morph(session, context);

    auto load_jsgrok_ql_from_memory = [&]() {
      return session->require(context, jsgrok_ql_js, jsgrok_ql_js_len);
    };

    auto jsgrok_ql_module = load_jsgrok_ql_from_memory();

    if (!jsgrok_ql_module || !jsgrok_ql_module.exports->IsObject()) {
      printf("Unable to require 'jsgrok-ql'!\n");
      return results;
    }

    auto apply_ref = session->get(context, jsgrok_ql_module.exports->ToObject(), "apply");

    if (apply_ref->IsUndefined() || !apply_ref->IsFunction()) {
      printf("Unable to find 'apply' exports in 'jsgrok-ql'!\n");

      return results;
    }

    auto apply = Local<Function>::Cast(apply_ref);

    for (auto filepath : filepaths) {
      string_t source_code;

      if (!fs.load_file(filepath, source_code)) {
        printf("ERROR: unable to read file %s\n", filepath.c_str());
        continue;
      }

      Local<Value> args[] = {
        String::NewFromUtf8(isolate, query.c_str()),
        String::NewFromUtf8(isolate, source_code.c_str()),
        String::NewFromUtf8(isolate, filepath.c_str()),
      };

      auto result = apply->Call(context, apply, 3, args);

      if (!result.IsEmpty()) {
        js_results.push_back({
          filepath,
          result.ToLocalChecked()
        });
      }
    }

    return cast_down(
      session,
      context,
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

    for (auto js_result : in) {
      auto result = js_result.value;

      if ((*result)->IsArray()) {
        auto result_list = v8::Array::Cast(*result);
        auto result_item_count = result_list->Length();

        for (uint32_t i = 0; i < result_item_count; ++i) {
          auto result_item = result_list->Get(context, i);

          if (!result_item.IsEmpty()) {
            out.push_back({ js_result.file, result_item.ToLocalChecked() });
          }
        }
      }
      else {
        out.push_back(js_result);
      }
    }

    return out;
  }

  analyzer::analysis_t analyzer::cast_down(
    v8_session *session,
    Local<Context> &context,
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

    for (auto js_result : in) {
      auto result = js_result.value;
      auto file = js_result.file;

      if (result.IsEmpty()) {
        continue;
      }
      else if (result->IsObject()) {
        auto object = result->ToObject();
        auto is_error = object->Has(context, String::NewFromUtf8(isolate, "error"));

        if (!is_error.IsNothing() && is_error.ToChecked()) {
          auto error_type = prop(object, "error_type")->ToUint32()->Value();

          out.errors.push_back({
            file,
            read_string(object, "message"),
            error_type
          });
        }
        else {
          analysis_match_t match;
          match.file = file;
          match.match = read_string(object, "match");
          match.line = prop(object, "line")->ToUint32()->Value();
          match.start = prop(object, "start")->ToUint32()->Value();
          match.end = prop(object, "end")->ToUint32()->Value();

          out.matches.push_back(match);
        }
      }
      else {
        out.errors.push_back({ file, "don't know how to handle results of this type" });
      }
    }

    return out;
  }
}
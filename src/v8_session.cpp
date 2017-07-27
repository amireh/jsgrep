#include "jsgrok/v8_session.hpp"
#include "jsgrok/fs.hpp"
#include <assert.h>

namespace jsgrok {
  using v8::Context;
  using v8::Script;
  using v8::String;
  using v8::MaybeLocal;
  using v8::Value;

  v8_session::v8_session() {
    isolate_create_params_.array_buffer_allocator = v8::ArrayBuffer::Allocator::NewDefaultAllocator();
    isolate_ = Isolate::New(isolate_create_params_);
    isolate_->Enter();
  };

  v8_session::~v8_session() {
    if (isolate_->IsInUse()) {
      isolate_->Exit();
    }

    isolate_->Dispose();
    delete isolate_create_params_.array_buffer_allocator;

    isolate_ = nullptr;
  };

  Isolate* v8_session::get_isolate() const {
    return isolate_;
  };

  v8_module v8_session::require(Local<Context> &context, const string_t &filepath) {
    v8_module             out;
    jsgrok::fs            fs;
    string_t              source_code;

    if (!isolate_->IsInUse()) {
      out.status = v8_module::EC_ISOLATE_NOT_ENTERED;
      return out;
    }

    // Create a string containing the JavaScript source code.
    auto file_ok = fs.load_file(filepath, source_code);

    if (!file_ok) {
      out.status = v8_module::EC_FILE_ERROR;
      return out;
    }

    MaybeLocal<Value> mebbe_return_value = eval_script(context, source_code);

    if (mebbe_return_value.IsEmpty()) {
      out.status = v8_module::EC_SCRIPT_ERROR;
      return out;
    }

    Local<Value> return_value = mebbe_return_value.ToLocalChecked();

    out.status = v8_module::EC_OK;
    out.exports = return_value;

    return out;
  }

  Handle<Value> v8_session::get(Local<Context> &context, Local<Object> &object, const char* key) {
    MaybeLocal<Value> value = object->Get(context, String::NewFromUtf8(isolate_, key));

    if (value.IsEmpty()) {
      return Handle<Value>();
    }
    else {
      return value.ToLocalChecked();
    }
  }

  MaybeLocal<Value> v8_session::eval_script(Local<Context> &context, string_t const& source_code) {
    Local<String> source_code_utf8 = String::NewFromUtf8(
      isolate_,
      source_code.c_str(),
      v8::NewStringType::kNormal
    ).ToLocalChecked();

    v8::TryCatch try_catch;

    MaybeLocal<Script> script_eval = Script::Compile(context, source_code_utf8);

    if (script_eval.IsEmpty() || !try_catch.CanContinue()) {
      printf("Unable to compile script!\n");

      return MaybeLocal<Value>();
    }

    MaybeLocal<Value> result = script_eval.ToLocalChecked()->Run(context);

    if (result.IsEmpty() || !try_catch.CanContinue()) {
      printf("Unable to run script!\n%s\n", *String::Utf8Value(try_catch.Message()->Get()));

      return MaybeLocal<Value>();
    }
    else {
      return result.ToLocalChecked();
    }
  }
}
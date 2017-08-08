#include "jsgrep/v8_session.hpp"
#include "jsgrep/v8_nodejs_context.hpp"
#include "jsgrep/v8_compat.hpp"
#include "jsgrep/fs.hpp"
#include <assert.h>
#include <iostream>

namespace jsgrep {
  using v8::Context;
  using v8::Script;
  using v8::String;
  using v8::MaybeLocal;
  using v8::Value;

  v8_session::v8_session() {
    isolate_create_params_.array_buffer_allocator = jsgrep::v8_compat::create_array_buffer_alloc();
    isolate_ = Isolate::New(isolate_create_params_);
    isolate_->Enter();
  };

  v8_session::~v8_session() {
    if (v8_compat::isolate_is_in_use(isolate_)) {
      isolate_->Exit();
      isolate_->Dispose();
    }

    jsgrep::v8_compat::free_array_buffer_alloc(isolate_create_params_.array_buffer_allocator);

    isolate_ = nullptr;
  };

  Isolate* v8_session::get_isolate() const {
    return isolate_;
  };

  v8_module v8_session::require(Local<Context> &parent_context, const unsigned char *buf, const unsigned int bufsz) const {
    v8_module module;

    if (!v8_compat::isolate_is_in_use(isolate_)) {
      module.status = v8_module::EC_ISOLATE_NOT_ENTERED;
      return module;
    }

    Local<Context> context = Context::New(isolate_);
    Context::Scope context_scope(context);

    v8_nodejs_context::morph(this, context);

    read_module_exports(context, module, eval_script(context, buf, bufsz));

    return module;
  }

  void v8_session::read_module_exports(
    Local<Context> const &context,
    v8_module &out,
    MaybeLocal<Value> const& return_value
  ) const {
    if (return_value.IsEmpty()) {
      out.status = v8_module::EC_SCRIPT_ERROR;

      return;
    }

    auto module = context
      ->Global()
        ->Get(context, String::NewFromUtf8(isolate_, "module"))
          .ToLocalChecked()
            ->ToObject()
    ;

    auto exports = module
      ->Get(context, String::NewFromUtf8(isolate_, "exports"))
        .ToLocalChecked()
    ;

    out.status = v8_module::EC_OK;
    out.exports = exports;
  }

  Handle<Value> v8_session::get(Local<Context> &context, Local<Object> const &object, const char* key) const {
    MaybeLocal<Value> value = object->Get(context, String::NewFromUtf8(isolate_, key));

    if (value.IsEmpty()) {
      return Handle<Value>();
    }
    else {
      return value.ToLocalChecked();
    }
  }

  MaybeLocal<Value> v8_session::eval_script(
    Local<Context> &context,
    const unsigned char* source_code_buf,
    const unsigned int bufsz
  ) const {
    Local<String> source_code = String::NewFromOneByte(
      isolate_,
      source_code_buf,
      v8::NewStringType::kInternalized,
      bufsz
    ).ToLocalChecked();

    v8::TryCatch try_catch;

    MaybeLocal<Script> script_eval = Script::Compile(context, source_code);

    if (script_eval.IsEmpty() || !try_catch.CanContinue()) {
      std::cerr << "Unable to compile script! " << *String::Utf8Value(try_catch.Message()->Get()) << std::endl;
      std::cerr << "Source code: " << *String::Utf8Value(source_code) << std::endl;

      return MaybeLocal<Value>();
    }

    MaybeLocal<Value> result = script_eval.ToLocalChecked()->Run(context);

    if (result.IsEmpty() || !try_catch.CanContinue()) {
      std::cerr
        << "Unable to run script!"
        << std::endl
        << *String::Utf8Value(try_catch.Message()->Get())
        << std::endl
      ;

      return MaybeLocal<Value>();
    }
    else {
      return result.ToLocalChecked();
    }
  }
}
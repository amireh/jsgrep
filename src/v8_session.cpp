#include "jsgrok/v8_session.hpp"
#include "jsgrok/fs.hpp"
#include <assert.h>

namespace jsgrok {
  using v8::Context;
  using v8::EscapableHandleScope;
  using v8::Script;
  using v8::String;
  using v8::MaybeLocal;
  using v8::Value;

  v8_session::v8_session() {
    isolate_create_params_.array_buffer_allocator = v8::ArrayBuffer::Allocator::NewDefaultAllocator();
    isolate_ = Isolate::New(isolate_create_params_);
  };

  v8_session::~v8_session() {
    isolate_->Dispose();
    delete isolate_create_params_.array_buffer_allocator;
  };

  Isolate* v8_session::get_isolate() const {
    return isolate_;
  };

  Handle<Object> v8_session::require(const string_t &filepath) {
    jsgrok::fs fs;
    string_t source_code;

    Isolate::Scope isolate_scope(isolate_);

    // Create a stack-allocated handle scope.
    EscapableHandleScope handle_scope(isolate_);

    // Create a new context.
    Local<Context> context = Context::New(isolate_);

    // Enter the context for compiling and running the hello world script.
    Context::Scope context_scope(context);

    // Create a string containing the JavaScript source code.
    fs.load_file(filepath, source_code);

    Local<String> source = String::NewFromUtf8(
      isolate_,
      source_code.c_str(),
      v8::NewStringType::kNormal
    ).ToLocalChecked();

    // Compile the source code.
    Local<Script> script = Script::Compile(context, source).ToLocalChecked();

    // Run the script to get the result.
    Local<Value> result = script->Run(context).ToLocalChecked();

    // expect module to return an object (exports):
    assert(result.IsObject());

    return handle_scope.Escape(result->ToObject());
  }

  Handle<Value> v8_session::get(Local<Object> &object, const char* key) {
    EscapableHandleScope handle_scope(isolate_);
    Local<Context>       context = Context::New(isolate_);

    MaybeLocal<Value>    value = object->Get(context, String::NewFromUtf8(isolate_, key));

    return handle_scope.Escape(value.ToLocalChecked());
  }
}
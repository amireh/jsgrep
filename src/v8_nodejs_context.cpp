#include "jsgrok/v8_nodejs_context.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/fs.hpp"

namespace jsgrok {
  using namespace v8;

  v8_nodejs_context::v8_nodejs_context() {
  };

  v8_nodejs_context::~v8_nodejs_context() {
  };

  void v8_nodejs_context::morph(v8_session const* session, Local<Context> &context) {
    provide_require(session, context);
    provide_module(session, context);
    provide_console(session, context);
  }

  void v8_nodejs_context::provide_require(
    v8_session const* session,
    Local<Context> &context
  ) {
    auto isolate = session->get_isolate();

    context->Global()->Set(
      context,
      String::NewFromUtf8(isolate, "require"),
      FunctionTemplate::New(
        isolate,
        &v8_nodejs_context::require,
        External::New(isolate, (void*)session)
      )->GetFunction()
    );
  }

  void v8_nodejs_context::provide_module(v8_session const* session, Local<Context>& context) {
    auto isolate = session->get_isolate();
    auto global  = context->Global();
    auto exports = Object::New(isolate);
    auto module = Object::New(isolate);

    module->Set(context, String::NewFromUtf8(isolate, "exports"), exports);

    global->Set(context, String::NewFromUtf8(isolate, "exports"), exports);
    global->Set(context, String::NewFromUtf8(isolate, "module"), module);
  }

  void v8_nodejs_context::provide_console(v8_session const* session, Local<Context>& context) {
    auto isolate = session->get_isolate();
    auto global  = context->Global();
    auto console = Object::New(isolate);

    console->Set(
      context,
      String::NewFromUtf8(isolate, "log"),
      FunctionTemplate::New(
        isolate,
        &v8_nodejs_context::log
      )->GetFunction()
    );

    global->Set(context, String::NewFromUtf8(isolate, "console"), console);
  }

  void v8_nodejs_context::require(const v8::FunctionCallbackInfo<Value> &args) {
    if (args.Length() == 1) {
      auto fs = jsgrok::fs();
      auto session = static_cast<v8_session*>(External::Cast(*args.Data())->Value());
      auto module_path = fs.resolve_asset(*String::Utf8Value(args[0]->ToString()));
      auto module = session->require(module_path);

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

  void v8_nodejs_context::log(const v8::FunctionCallbackInfo<Value> &args) {
    printf("%s\n", *String::Utf8Value(args[0]->ToString()));
  }
}
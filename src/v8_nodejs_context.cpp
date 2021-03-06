#include "jsgrep/v8_nodejs_context.hpp"
#include "jsgrep/v8_session.hpp"
#include "jsgrep/fs.hpp"

namespace jsgrep {
  using namespace v8;

  v8_nodejs_context::v8_nodejs_context() {
  };

  v8_nodejs_context::~v8_nodejs_context() {
  };

  void v8_nodejs_context::morph(v8_session const* session, Local<Context> &context) {
    provide_module(session, context);
    provide_console(session, context);
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

  void v8_nodejs_context::log(const v8::FunctionCallbackInfo<Value> &args) {
    printf("%s\n", *String::Utf8Value(args[0]->ToString()));
  }
}
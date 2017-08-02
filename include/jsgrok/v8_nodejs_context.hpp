#ifndef H_JSGROK_NODEJS_CONTEXT_H
#define H_JSGROK_NODEJS_CONTEXT_H

#include "jsgrok/types.hpp"
#include <vector>
#include <functional>
#include "v8/v8.h"

namespace jsgrok {
  using v8::Isolate;
  using v8::Local;
  using v8::Context;
  using v8::Value;
  using v8::FunctionCallbackInfo;

  class v8_session;
  class v8_nodejs_context {
  public:
    typedef struct {
      v8_session      *session;
      Local<Context>  *context;
    } require_context_t;

    v8_nodejs_context();
    virtual ~v8_nodejs_context();

    static void morph(v8_session const*, Local<Context>&);

  protected:
    static void provide_module(v8_session const*, Local<Context>&);
    static void provide_console(v8_session const*, Local<Context>&);

    static void log(const FunctionCallbackInfo<Value>&);
  };
}

#endif
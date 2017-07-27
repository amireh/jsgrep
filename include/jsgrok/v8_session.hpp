#ifndef H_JSGROK_V8_SESSION_H
#define H_JSGROK_V8_SESSION_H

#include <functional>
#include "v8/v8.h"
#include "jsgrok/types.hpp"
#include "jsgrok/v8_module.hpp"

using v8::Context;
using v8::Handle;
using v8::MaybeLocal;
using v8::HandleScope;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::Value;

namespace jsgrok {
  class v8_session {
  public:
    v8_session();
    virtual ~v8_session();

    Isolate* get_isolate() const;

    v8_module require(Local<Context>&, string_t const&);
    Handle<Value> get(Local<Context>&, Local<Object>&, const char*);

  protected:
    Isolate *isolate_;
    Isolate::CreateParams isolate_create_params_;

    MaybeLocal<Value> eval_script(Local<Context> &context, string_t const& source);
  };
}

#endif
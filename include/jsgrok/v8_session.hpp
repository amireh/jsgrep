#ifndef H_JSGROK_V8_SESSION_H
#define H_JSGROK_V8_SESSION_H

#include <functional>
#include "v8/v8.h"
#include "jsgrok/types.hpp"

using v8::Context;
using v8::Handle;
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

    Handle<Object> require(Local<Context>&, string_t const&);

    Isolate* get_isolate() const;

    Handle<Value> get(Local<Context> &, Local<Object> &, const char*);

  protected:
    Isolate *isolate_;
    Isolate::CreateParams isolate_create_params_;
    Local<Context>  *global_context_;
    HandleScope *scope_;
  };
}

#endif
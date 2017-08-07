#ifndef H_JSGROK_V8_SESSION_H
#define H_JSGROK_V8_SESSION_H

#include <functional>
#include "v8.h"
#include "jsgrok/types.hpp"
#include "jsgrok/v8_module.hpp"

using v8::Context;
using v8::Handle;
using v8::MaybeLocal;
using v8::HandleScope;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

namespace jsgrok {
  class v8_session {
  public:
    v8_session();
    virtual ~v8_session();

    Isolate* get_isolate() const;

    /**
     * Load a script from disk in a new nodejs-like context.
     */
    v8_module require(string_t const&);

    /**
     * Load a script from disk into an existing context.
     */
    v8_module require(Local<Context>&, string_t const&);

    /**
     * Load a script from memory buffer into an existing context.
     */
    v8_module require(Local<Context>&, const unsigned char *, const unsigned int);

    Handle<Value> get(Local<Context>&, Local<Object> const&, const char*);

  protected:
    Isolate *isolate_;
    Isolate::CreateParams isolate_create_params_;

    MaybeLocal<Value> eval_script(Local<Context> &context, string_t const& source);
    MaybeLocal<Value> eval_script(Local<Context> &context, const unsigned char *, const unsigned int);
    MaybeLocal<Value> eval_script(Local<Context> &context, Local<String> const&);

    void read_module_exports(Local<Context> const &context, v8_module &module, MaybeLocal<Value> const& script) const;
  };
}

#endif
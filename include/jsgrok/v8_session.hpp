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
    // template <typename T>
    // using getter_t = std::function<void(Local <T>&)>;
    // // struct types {
    // //   typedef std::function<void(Local <T>&)> getter_t;
    // // };

    v8_session();
    virtual ~v8_session();

    Handle<Object> require(string_t const&);

    Isolate* get_isolate() const;

    Handle<Value> get(Local<Object> &, const char*);

    // template <typename T>
    // Handle<T> get(Local<Object> &object, const char* key, getter_t<T> getter)
    // {
    //   Handle<Value> value = get(object, key);

    //   if (value.IsEmpty()) {
    //     return v8::Null(isolate_);
    //   }
    //   else {
    //     Handle<T> converted = Handle<T>::Cast(value);
    //     // Handle<Value> escaped = handle_scope.Escape(value.ToLocalChecked());

    //     getter(converted);

    //     return converted;
    //   }
    // }

  protected:
    Isolate *isolate_;
    Isolate::CreateParams isolate_create_params_;
    Local<Context>  *global_context_;
    HandleScope *scope_;
  };
}

#endif
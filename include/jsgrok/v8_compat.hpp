#ifndef H_JSGROK_V8_H
#define H_JSGROK_V8_H

#include "v8.h"
#include "v8-version.h"

namespace jsgrok {
  namespace v8_compat {
    void initialize(int argc, char** argv);
    v8::ArrayBuffer::Allocator* create_array_buffer_alloc();
    void free_array_buffer_alloc(v8::ArrayBuffer::Allocator*);
    bool isolate_is_in_use(v8::Isolate *);
    void teardown();
  }
}

#endif
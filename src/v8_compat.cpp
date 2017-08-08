#include "jsgrep/v8_compat.hpp"
#include "libplatform/libplatform.h"
#include <cstdlib>

namespace jsgrep {
  namespace v8_compat {
    static v8::Platform *platform;
    using namespace v8;

    #if V8_MAJOR_VERSION == 5 && V8_MINOR_VERSION < 9
      // thanks to https://stackoverflow.com/a/22296511
      class MallocArrayBufferAllocator : public v8::ArrayBuffer::Allocator {
      public:
        virtual void* Allocate(size_t length) { return malloc(length); }
        virtual void* AllocateUninitialized(size_t length) { return malloc(length); }
        virtual void Free(void* data, size_t length) { free(data); }
      };
    #endif

    void initialize(int argc, char** argv) {
      platform = platform::CreateDefaultPlatform();

      V8::InitializePlatform(platform);
      V8::Initialize();
    }

    void teardown() {
      V8::Dispose();
      V8::ShutdownPlatform();
      delete platform;
      platform = nullptr;
    }

    v8::ArrayBuffer::Allocator* create_array_buffer_alloc() {
      #if V8_MAJOR_VERSION == 5 && V8_MINOR_VERSION < 9
        return new MallocArrayBufferAllocator();
      #else
        return v8::ArrayBuffer::Allocator::NewDefaultAllocator();
      #endif
    }

    bool isolate_is_in_use(v8::Isolate *isolate) {
      #if V8_MAJOR_VERSION == 5 && V8_MINOR_VERSION < 9
        return isolate == v8::Isolate::GetCurrent();
      #else
        return isolate->IsInUse();
      #endif
    }

    void free_array_buffer_alloc(v8::ArrayBuffer::Allocator* alloc) {
      delete alloc;
    }
  }
}
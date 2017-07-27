#ifndef H_JSGROK_H
#define H_JSGROK_H

#include <string>
#include "v8/libplatform/libplatform.h"
#include "v8/v8.h"

namespace jsgrok {
  typedef std::string string_t;
  typedef std::string path_t;
  typedef unsigned long uint64_t;

  static v8::Platform *platform = nullptr;
  static void init(int argc, char** argv) {
    assert(!platform);

    v8::V8::InitializeICUDefaultLocation(argv[0]);
    v8::V8::InitializeExternalStartupData(argv[0]);

    platform = v8::platform::CreateDefaultPlatform();

    v8::V8::InitializePlatform(platform);
    v8::V8::Initialize();
  };

  static void teardown() {
    assert(platform);

    v8::V8::Dispose();
    v8::V8::ShutdownPlatform();
    delete platform;
    platform = nullptr;
  };
}

#endif
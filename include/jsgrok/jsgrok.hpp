#ifndef H_JSGROK_H
#define H_JSGROK_H

#include <string>
#include "libplatform/libplatform.h"
#include "v8.h"
#include "jsgrok/v8_compat.hpp"

namespace jsgrok {
  typedef std::string string_t;
  typedef std::string path_t;
  typedef unsigned long uint64_t;

  static void init(int argc, char** argv) {
    v8_compat::initialize(argc, argv);
  };

  static void teardown() {
    v8_compat::teardown();
  };
}

#endif
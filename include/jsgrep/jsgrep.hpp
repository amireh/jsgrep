#ifndef H_JSGREP_H
#define H_JSGREP_H

#include <string>
#include "libplatform/libplatform.h"
#include "v8.h"
#include "jsgrep/v8_compat.hpp"

namespace jsgrep {
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
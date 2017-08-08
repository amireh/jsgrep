#ifndef H_JSGREP_TEST_UTILS_H
#define H_JSGREP_TEST_UTILS_H

#include "jsgrep/types.hpp"

namespace jsgrep::test_utils {
  typedef struct {
    unsigned char *value;
    unsigned int  sz;
  } buffer_t;

  string_t resolve(string_t const&);
  buffer_t copy_string(string_t const&);
  buffer_t load_fixture_file(string_t const&);
}

#endif
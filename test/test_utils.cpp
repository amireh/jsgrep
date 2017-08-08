#include "test_utils.hpp"
#include "jsgrep/fs.hpp"
#include <cstring>

namespace jsgrep::test_utils {
  string_t resolve(string_t const& path) {
    return "test/fixtures/" + path;
  }

  buffer_t copy_string(string_t const& src) {
    buffer_t out;

    out.value = new unsigned char[src.length()+1];
    strcpy((char *)out.value, src.c_str());

    out.sz = src.length();

    return out;
  }

  buffer_t load_fixture_file(string_t const& path) {
    string_t source;

    jsgrep::fs().load_file(path, source);

    return copy_string(source);
  }
}
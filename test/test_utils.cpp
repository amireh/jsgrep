#include "test_utils.hpp"

namespace jsgrok::test_utils {
  string_t resolve(string_t const& path) {
    return "test/fixtures/" + path;
  }
}
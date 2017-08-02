#include "test_utils.hpp"
#include "cpplocate/cpplocate.h"
#include "cpplocate/ModuleInfo.h"

namespace jsgrok::test_utils {
  static const cpplocate::ModuleInfo module_info(cpplocate::findModule("jsgrok-tests"));

  string_t resolve(string_t const& group, string_t const& path) {
    return module_info.value(group) + "/" + path;
  }
}
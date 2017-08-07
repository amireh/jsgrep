#define CATCH_CONFIG_RUNNER

#include <cstdlib>
#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrok/jsgrok.hpp"
#include "jsgrok/fs.hpp"
#include <iostream>

using jsgrok::string_t;

static bool file_exists(string_t const& path) {
  string_t buf;
  jsgrok::fs fs;

  return fs.load_file(path, buf);
}

int main(int argc, char **argv) {
  using namespace v8;
  jsgrok::fs fs;

  if (!file_exists(jsgrok::test_utils::resolve(".keepme"))) {
    std::cerr << argv[0] << ": must be run from root where test/fixtures is readable." << std::endl;
    return 1;
  }

  int result;

  jsgrok::init(argc, argv);

  result = Catch::Session().run( argc, argv );

  jsgrok::teardown();

  return result;
}

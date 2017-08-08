#define CATCH_CONFIG_RUNNER

#include <cstdlib>
#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrep/jsgrep.hpp"
#include "jsgrep/fs.hpp"
#include <iostream>

using jsgrep::string_t;

static bool file_exists(string_t const& path) {
  string_t buf;
  jsgrep::fs fs;

  return fs.load_file(path, buf);
}

int main(int argc, char **argv) {
  using namespace v8;
  jsgrep::fs fs;

  if (!file_exists(jsgrep::test_utils::resolve(".keepme"))) {
    std::cerr << argv[0] << ": must be run from root where test/fixtures is readable." << std::endl;
    return 1;
  }

  int result;

  jsgrep::init(argc, argv);

  result = Catch::Session().run( argc, argv );

  jsgrep::teardown();

  return result;
}

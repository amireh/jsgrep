#define CATCH_CONFIG_RUNNER

#include <cstdlib>
#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrok/jsgrok.hpp"

int main(int argc, char **argv) {
  using namespace v8;

  int result;

  jsgrok::init(argc, argv);

  result = Catch::Session().run( argc, argv );

  jsgrok::teardown();

  return result;
}

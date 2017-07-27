#define CATCH_CONFIG_RUNNER

#include <cstdlib>
#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrok/jsgrok.hpp"
#include "v8/libplatform/libplatform.h"
#include "v8/v8.h"

jsgrok::test_config_t jsgrok::test_config; // TEST GLOBAL

int main(int argc, char **argv) {
  using namespace v8;

  int result;

  jsgrok::test_config.argc = argc;
  jsgrok::test_config.argv = argv;
  jsgrok::init(argc, argv);

  result = Catch::Session().run( argc, argv );

  jsgrok::teardown();

  return result;
}

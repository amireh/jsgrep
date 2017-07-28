#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrok/types.hpp"
#include "jsgrok/functional/filter.hpp"

TEST_CASE("jsgrok::functional::filter") {
  using namespace jsgrok::functional;
  using jsgrok::functional::filter;
  using jsgrok::string_t;
  using std::vector;

  vector<string_t> files({
    "a",
    "b",
    "src/a.js",
    "src/b.js",

    "src/a.jsx",
    "src/b.jsx",

    "src/inner/a",
    "src/inner/b",

    "README.md",
  });

  WHEN("There are no filters") {
    REQUIRE(filter(files).size() == files.size());
  }

  WHEN("There are file inclusion filters") {
    THEN("It selects only the files that match any of those filters") {
      REQUIRE(filter(files, { "*.js" }).size() == 2);
    }
  }

  WHEN("There are file exclusion filters") {
    THEN("It selects only the files that do not match any of those filters") {
      REQUIRE(filter(files, INCLUDE_ALL, { "*.js", "*.jsx" }).size() == 5);
    }
  }

  WHEN("There are dir exclusion filters") {
    THEN("It selects only the files in directories that do not match any of those filters") {
      REQUIRE(filter(files, INCLUDE_ALL, EXCLUDE_NONE, { "src" }).size() == 3);
    }
  }
}

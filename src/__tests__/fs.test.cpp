#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrok/fs.hpp"
#include "jsgrok/types.hpp"

TEST_CASE("jsgrok::fs") {
  using Catch::EndsWith;
  using jsgrok::string_t;

  jsgrok::fs subject;

  SECTION("loading_files") {
    auto acorn_path = subject.resolve_asset("acorn.js");
    string_t acorn_src;

    subject.load_file(acorn_path, acorn_src);

    REQUIRE(acorn_src.length() > 0);
  }

  SECTION("resolving_assets") {
    REQUIRE_THAT(subject.resolve_asset("analyze.js"), EndsWith("/analyze.js"));
  }
}

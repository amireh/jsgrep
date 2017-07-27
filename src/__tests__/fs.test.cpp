#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrok/fs.hpp"
#include "jsgrok/types.hpp"

TEST_CASE("jsgrok::fs") {
  using Catch::EndsWith;
  using jsgrok::string_t;

  jsgrok::fs subject;

  SECTION("#resolve") {
    auto acorn_path = subject.resolve("assets_path", "parse.js");
    string_t acorn_src;

    subject.load_file(acorn_path, acorn_src);

    REQUIRE(acorn_src.length() > 0);
  }

  SECTION("#resolve_asset") {
    auto acorn_path = subject.resolve_asset("parse.js");
    string_t acorn_src;

    subject.load_file(acorn_path, acorn_src);

    REQUIRE(acorn_src.length() > 0);
  }

  SECTION("resolving assets") {
    REQUIRE_THAT(subject.resolve_asset("parse.js"), EndsWith("/parse.js"));
  }

  SECTION("#glob") {
    jsgrok::fs subject("jsgrok-test");

    WHEN("It is given a path") {
      THEN("It rejects") {
        subject.glob({
          subject.resolve("fixtures_path", "")
        });
      }
    }

    WHEN("It is given a glob pattern") {
      THEN("It searches for files matching that pattern") {
        auto files = subject.glob({
          subject.resolve("fixtures_path", "**/*")
        });

        REQUIRE(files.size() > 0);
      }
    }
  }

  SECTION("#glob [GLOB_RECURSIVE]") {
    THEN("It searches for all files under that directory") {
      auto files = subject.glob(
        { subject.resolve("fixtures_path", "") },
        jsgrok::fs::GLOB_RECURSIVE
      );

      REQUIRE(files.size() > 0);
    }
  }
}

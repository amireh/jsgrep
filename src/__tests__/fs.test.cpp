#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrep/fs.hpp"
#include "jsgrep/types.hpp"

TEST_CASE("jsgrep::fs") {
  using Catch::EndsWith;
  using jsgrep::string_t;
  using jsgrep::test_utils::resolve;

  jsgrep::fs subject;

  SECTION("#glob") {
    jsgrep::fs subject;

    WHEN("It is given a path") {
      THEN("It rejects") {
        subject.glob({
          resolve("")
        });
      }
    }

    WHEN("It is given a glob pattern") {
      THEN("It searches for files matching that pattern") {
        auto files = subject.glob({
          resolve("**/*")
        });

        REQUIRE(files.size() > 0);
      }
    }
  }

  SECTION("#glob [GLOB_RECURSIVE]") {
    THEN("It searches for all files under that directory") {
      auto files = subject.glob(
        { resolve("") },
        jsgrep::fs::GLOB_RECURSIVE
      );

      REQUIRE(files.size() > 0);
    }
  }
}

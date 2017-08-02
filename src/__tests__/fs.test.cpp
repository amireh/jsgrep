#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrok/fs.hpp"
#include "jsgrok/types.hpp"

TEST_CASE("jsgrok::fs") {
  using Catch::EndsWith;
  using jsgrok::string_t;
  using jsgrok::test_utils::resolve;

  jsgrok::fs subject;

  SECTION("#glob") {
    jsgrok::fs subject;

    WHEN("It is given a path") {
      THEN("It rejects") {
        subject.glob({
          resolve("fixtures_path", "")
        });
      }
    }

    WHEN("It is given a glob pattern") {
      THEN("It searches for files matching that pattern") {
        auto files = subject.glob({
          resolve("fixtures_path", "**/*")
        });

        REQUIRE(files.size() > 0);
      }
    }
  }

  SECTION("#glob [GLOB_RECURSIVE]") {
    THEN("It searches for all files under that directory") {
      auto files = subject.glob(
        { resolve("fixtures_path", "") },
        jsgrok::fs::GLOB_RECURSIVE
      );

      REQUIRE(files.size() > 0);
    }
  }
}

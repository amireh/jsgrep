#include <ostream>
#include <iostream>
#include "catch.hpp"
#include "jsgrok/analyzer.hpp"
#include "jsgrok/reporter.hpp"
#include "jsgrok/cli.hpp"
#include "jsgrok/types.hpp"
#include "jsgrok/functional/colorize.hpp"

TEST_CASE("jsgrok::reporter") {
  using jsgrok::string_t;
  using analyzer = jsgrok::analyzer;
  using options_t = jsgrok::cli::options_t;
  using jsgrok::functional::colorize;
  using Color = jsgrok::functional::Color;

  jsgrok::cli cli;
  options_t options(cli.parse(std::vector<string_t>({})));
  jsgrok::reporter subject(options);

  WHEN("There are errors") {
    std::ostringstream out;

    analyzer::analysis_t analysis;
    analyzer::analysis_error_t error;
    error.file = "some_file.js";
    error.message = ":barf:";
    error.error_type = analyzer::SourceCodeError;

    analysis.errors.push_back(error);

    WHEN("The verbosity allows it...") {
      options.verbosity = options_t::VERBOSITY_DEBUG;

      THEN("It reports parse errors") {
        subject.report(analysis, out);
        REQUIRE(out.str() == "[ParseError] some_file.js: :barf:\n");
      }

      THEN("It reports search routine errors as an internal error") {
        analysis.errors.back().error_type = analyzer::SearchError;
        subject.report(analysis, out);
        REQUIRE(out.str() == "[InternalError] some_file.js: :barf:\n");
      }
    }

    WHEN("The verbosity is set to QUIET...") {
      options.verbosity = options_t::VERBOSITY_QUIET;

      THEN("It does not report them") {
        subject.report(analysis, out);
        REQUIRE(out.str() == "");
      }
    }
  }

  SECTION("Reporting matches") {
    analyzer::analysis_t analysis;
    std::ostringstream out;
    analyzer::analysis_match_t match;

    match.file = "some_file.js";
    match.match = "Hello World!";
    match.line = 3;
    match.start = 1;
    match.end = 4;

    analysis.matches.push_back(match);

    auto assert_equals = [&](string_t const& expected) {
      subject.report(analysis, out);
      REQUIRE(out.str() == expected);
    };

    auto assert_contains = [&](string_t const& expected) {
      subject.report(analysis, out);
      REQUIRE_THAT(out.str(), Catch::Contains(expected));
    };

    auto assert_does_not_contain = [&](string_t const& expected) {
      subject.report(analysis, out);
      REQUIRE_THAT(out.str(), !Catch::Contains(expected));
    };

    auto configure = [&](std::vector<string_t> const& argv) {
      options = cli.parse(argv);
    };

    WHEN("Running with defaults") {
      THEN("It reports the filename") {
        assert_contains("some_file.js");
      }

      THEN("It colorizes the filename") {
        assert_contains(colorize(Color::Magenta, "some_file.js"));
      }

      THEN("It reports the match") {
        assert_contains("H" + colorize(Color::Red, "ell") + "o World!");
      }
    }

    WHEN("-n, --line-number") {
      configure({ "-n" });

      THEN("It includes line numbers") {
        assert_contains("3:");
      }

      configure({});

      THEN("It ignores line numbers") {
        assert_does_not_contain("3:");
      }
    }

    WHEN("-h, --no-filename") {
      configure({ "-h", "--no-color" });

      THEN("It hides file names") {
        assert_equals("Hello World!\n");
      }
    }

    WHEN("-C, --no-color") {
      configure({ "-C" });

      THEN("It does not colorize the file name") {
        assert_contains("some_file.js");
        assert_does_not_contain(colorize(Color::Magenta, "some_file.js"));
      }

    }
  }
}

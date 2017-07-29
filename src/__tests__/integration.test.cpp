#include "catch.hpp"
#include "jsgrok/analyzer.hpp"
#include "jsgrok/types.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/fs.hpp"

TEST_CASE("jsgrok") {
  using jsgrok::string_t;

  jsgrok::fs fs("jsgrok-tests");
  jsgrok::analyzer analyzer;
  jsgrok::v8_session session;

  auto assert_script_is_analyzed = [&](const char *script) {
    auto filepath = fs.resolve("fixtures_path", script);
    auto query = "";
    auto analysis = analyzer.apply(&session, query, { filepath });

    REQUIRE(analysis.errors.size() == 0);
  };

  SECTION("ES7 async/await") {
    assert_script_is_analyzed("plugins/asyncAwait.js");
  }

  SECTION("ES7 static class properties") {
    assert_script_is_analyzed("plugins/staticClassPropertyInitializer.js");
  }

  SECTION("Object rest/spread") {
    assert_script_is_analyzed("plugins/objectSpread.js");
  }

  SECTION("dynamic imports") {
    assert_script_is_analyzed("plugins/dynamicImport.js");
  }
}

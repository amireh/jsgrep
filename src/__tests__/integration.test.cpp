#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrep/analyzer.hpp"
#include "jsgrep/types.hpp"
#include "jsgrep/v8_session.hpp"

TEST_CASE("jsgrep") {
  using jsgrep::string_t;
  using jsgrep::test_utils::resolve;

  jsgrep::analyzer analyzer;
  jsgrep::v8_session session;

  auto assert_script_is_analyzed = [&](const char *script) {
    auto filepath = resolve(script);
    auto query = "abc";
    auto analysis = analyzer.apply(&session, query, { filepath });

    REQUIRE(analysis.errors.size() == 0);
  };

  SECTION("JSX") {
    assert_script_is_analyzed("plugins/jsx.js");
  }

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

#include "catch.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/fs.hpp"
#include "jsgrok/types.hpp"

TEST_CASE("jsgrok::v8_session") {
  using jsgrok::string_t;
  using jsgrok::v8_module;
  using namespace v8;

  jsgrok::fs fs("jsgrok-tests");
  jsgrok::v8_session subject;

  SECTION("It generates an isolate implicitly") {
    REQUIRE(subject.get_isolate() != nullptr);
  }

  SECTION("It enters the isolate implicitly") {
    REQUIRE(subject.get_isolate()->IsInUse());
  }

  SECTION("It does not generate nor use a context") {
    REQUIRE(!subject.get_isolate()->InContext());
  }

  SECTION("#require") {
    Isolate         *isolate = subject.get_isolate();
    HandleScope     handle_scope(isolate);
    Local<Context>  context = Context::New(isolate);
    Context::Scope  context_scope(context);

    WHEN("The isolate can not be used for some reason...") {
      auto module_path = fs.resolve("fixtures_path", "exportGlobal.js");

      isolate->Exit();

      THEN("It returns EC_ISOLATE_NOT_ENTERED") {
        auto module = subject.require(context, module_path);
        REQUIRE(module.status == v8_module::EC_ISOLATE_NOT_ENTERED);
      }
    }

    WHEN("The script file does not exist or can't be read...") {
      auto script_path = fs.resolve("fixtures_path", "adsfasdf.js");

      THEN("It returns EC_FILE_ERROR") {
        auto module = subject.require(context, script_path);
        REQUIRE(module.status == v8_module::EC_FILE_ERROR);
      }
    }

    GIVEN("A module that exports to global...") {
      auto script_path = fs.resolve("fixtures_path", "exportGlobal.js");

      THEN("It returns EC_OK") {
        auto module = subject.require(context, script_path);

        REQUIRE(module.status == v8_module::EC_OK);
      }

      THEN("It yields the return value") {
        auto module = subject.require(context, script_path);

        REQUIRE(module.exports->IsUndefined());
      }
    }

    GIVEN("A module that exports an object...") {
      auto script_path = fs.resolve("fixtures_path", "exportObject.js");

      THEN("It returns EC_OK") {
        auto module = subject.require(context, script_path);

        REQUIRE(module.status == v8_module::EC_OK);
      }

      THEN("It yields a handle to the export") {
        auto module = subject.require(context, script_path);

        REQUIRE(module.exports->IsObject());
      }
    }
  }
}

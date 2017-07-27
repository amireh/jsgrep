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

    auto prop = [&](Local<Object> object, const char *key) {
      return object->Get(context, String::NewFromUtf8(isolate, key));
    };

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

      THEN("It yields the default `module.exports` object") {
        auto module = subject.require(context, script_path);

        REQUIRE(module.exports->IsObject());
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

    GIVEN("A module that sets `module.exports`...") {
      auto script = fs.resolve("fixtures_path", "moduleExports.js");

      THEN("It returns EC_OK") {
        REQUIRE(subject.require(context, script).status == v8_module::EC_OK);
      }

      THEN("It yields a handle to the export") {
        auto module = subject.require(context, script);

        REQUIRE(module.exports->IsNumber());
        REQUIRE(module.exports->ToNumber()->Value() == 1);
      }
    }

    GIVEN("A module that sets property on `exports`...") {
      auto script = fs.resolve("fixtures_path", "exports.js");

      THEN("It returns EC_OK") {
        REQUIRE(subject.require(context, script).status == v8_module::EC_OK);
      }

      THEN("It retains the exports object and the defined property") {
        auto module = subject.require(context, script);

        REQUIRE(module.exports->IsObject());

        auto a = prop(module.exports->ToObject(), "a");

        REQUIRE(!a.IsEmpty());
        REQUIRE(a.ToLocalChecked()->IsNumber());
        REQUIRE(a.ToLocalChecked()->ToNumber()->Value() == 1);
      }
    }
  }
}

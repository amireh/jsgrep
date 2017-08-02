#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrok/v8_nodejs_context.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/types.hpp"

TEST_CASE("jsgrok::v8_nodejs_context") {
  using jsgrok::string_t;
  using jsgrok::v8_nodejs_context;
  using jsgrok::test_utils::resolve;
  using namespace v8;

  jsgrok::v8_session session;

  Isolate         *isolate = session.get_isolate();
  HandleScope     handle_scope(isolate);
  Local<Context>  context = Context::New(isolate);
  Context::Scope  context_scope(context);
  auto global = context->Global();

  auto to_string = [&](Local<Value> x) -> string_t {
    return *(String::Utf8Value(x->ToString()));
  };

  auto to_bool = [&](Local<Value> x) {
    return x->ToBoolean()->Value();
  };

  auto prop = [&](Local<Object> object, const char *key) {
    return object->Get(context, String::NewFromUtf8(isolate, key));
  };

  auto assert_script_returns_truthy = [&](const char *script) {
    auto module = session.require(context, resolve("fixtures_path", script));

    REQUIRE(module.status == jsgrok::v8_module::EC_OK);

    auto exports = module.exports;

    REQUIRE(!exports.IsEmpty());
    REQUIRE(exports->IsBoolean());
    REQUIRE(to_bool(exports));
  };

  v8_nodejs_context::morph(&session, context);

  SECTION("It provides a global 'exports' object") {
    assert_script_returns_truthy("exportsIsDefined.js");
  }

  SECTION("It provides a global 'module' object") {
    assert_script_returns_truthy("moduleIsDefined.js");
  }

  SECTION("It points 'module.exports' to 'exports' by default") {
    assert_script_returns_truthy("moduleExportsIsDefined.js");
  }
}

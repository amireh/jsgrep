#include "catch.hpp"
#include "jsgrok/v8_cluster.hpp"
#include "jsgrok/types.hpp"

TEST_CASE("jsgrok::v8_cluster") {
  using Catch::EndsWith;
  using jsgrok::string_t;
  using jsgrok::v8_session;

  jsgrok::v8_cluster subject;

  SECTION("It spawns and despawns v8 sessions") {
    auto do_work = [&](v8_session *, void*) {};

    subject.spawn(do_work);
    subject.clear();

    REQUIRE(subject.session_count() == 0);
  }

  SECTION("It calls my worker with the spawned session") {
    auto called = false;
    auto do_work = [&](v8_session *, void*) {
      called = true;
    };

    subject.spawn(do_work);
    subject.clear();

    REQUIRE(called);
  }

  subject.clear();
}

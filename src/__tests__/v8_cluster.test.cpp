#include "catch.hpp"
#include "jsgrep/v8_cluster.hpp"
#include "jsgrep/types.hpp"

TEST_CASE("jsgrep::v8_cluster") {
  using Catch::EndsWith;
  using jsgrep::string_t;
  using jsgrep::v8_session;

  jsgrep::v8_cluster subject;

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

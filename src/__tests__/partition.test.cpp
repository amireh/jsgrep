#include "catch.hpp"
#include "test_utils.hpp"
#include "jsgrok/types.hpp"
#include "jsgrok/functional/partition.hpp"

TEST_CASE("jsgrok::functional::partition") {
  using jsgrok::functional::partition;

  SECTION("it works with an empty set") {
    auto partitions = partition({}, 2);

    REQUIRE(partitions.size() == 2);
    REQUIRE(partitions[0].size() == 0);
    REQUIRE(partitions[1].size() == 0);
  }

  SECTION("it distributes items to the partitions in a round-robin fashion") {
    auto partitions = partition({ "a", "b", "c" }, 2);

    REQUIRE(partitions.size() == 2);
    REQUIRE(partitions[0].size() == 2);
    REQUIRE(partitions[0][0] == "a");
    REQUIRE(partitions[0][1] == "c");

    REQUIRE(partitions[1].size() == 1);
    REQUIRE(partitions[1][0] == "b");
  }

  GIVEN("More items than partitions...") {
    THEN("It cramps them") {
      auto partitions = partition({ "a", "b", "c" }, 1);

      REQUIRE(partitions.size() == 1);
      REQUIRE(partitions[0].size() == 3);
      REQUIRE(partitions[0][0] == "a");
      REQUIRE(partitions[0][1] == "b");
      REQUIRE(partitions[0][2] == "c");
    }
  }
}

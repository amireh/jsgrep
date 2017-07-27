SET(TARGET ${PROJECT_NAME}-tests)

INCLUDE_DIRECTORIES(.) # for test_utils.hpp
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/deps/catch-1.5.6) # for catch.hpp
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/deps/FakeIt-2.0.2/config/standalone)
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/deps/FakeIt-2.0.2/include)
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/include)
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/deps)
INCLUDE_DIRECTORIES(${CMAKE_BINARY_DIR}/exports)
INCLUDE_DIRECTORIES(${cpplocate_DIR}/source/cpplocate/include)
INCLUDE_DIRECTORIES(${cpplocate_DIR}/build/source/cpplocate/include)

ADD_EXECUTABLE(${TARGET}
  ../src/fs.cpp
  ../src/v8_cluster.cpp
  ../src/v8_session.cpp
  ../src/analyzer.cpp
  ../src/__tests__/fs.test.cpp
  ../src/__tests__/v8_cluster.test.cpp
  ../src/__tests__/v8_session.test.cpp

  test_utils.cpp
  main.cpp
)

ADD_DEFINITIONS(-std=c++11)

IF(APPLE)
  ADD_DEFINITIONS(
    # FakeIt noise:
    -Wno-inconsistent-missing-override
  )
ENDIF()

TARGET_LINK_LIBRARIES(${TARGET} ${JSGROK_LIBRARIES})

generate_module_info(jsgrok-tests
  VALUES
  name          "jsgrok-tests"
  version       "1.0.0"
  description   "Syntactic JavaScript grep."
  author        "Instructure, INC."

  BUILD_VALUES
  fixtures_path "${PROJECT_SOURCE_DIR}/test/fixtures"
)

export_module_info(jsgrok-tests TARGET ${TARGET})

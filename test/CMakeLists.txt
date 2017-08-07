SET(TARGET ${PROJECT_NAME}-tests)

INCLUDE_DIRECTORIES(.) # for test_utils.hpp
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/deps/catch-1.5.6) # for catch.hpp
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/deps/FakeIt-2.0.2/config/standalone)
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/deps/FakeIt-2.0.2/include)
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/include)
INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/deps)
INCLUDE_DIRECTORIES(${CMAKE_BINARY_DIR}/exports)

ADD_EXECUTABLE(${TARGET}
  ${JSGROK_SOURCES}

  ../src/__tests__/analyzer.test.cpp
  ../src/__tests__/fs.test.cpp
  ../src/__tests__/filter.test.cpp
  ../src/__tests__/partition.test.cpp
  ../src/__tests__/reporter.test.cpp
  ../src/__tests__/v8_cluster.test.cpp
  ../src/__tests__/v8_nodejs_context.test.cpp
  ../src/__tests__/v8_session.test.cpp
  ../src/__tests__/integration.test.cpp

  test_utils.cpp
  main.cpp
)

ADD_DEPENDENCIES(${TARGET} jsgrok-ql)
ADD_DEFINITIONS(-std=c++11)

IF(APPLE)
  ADD_DEFINITIONS(
    # FakeIt noise:
    -Wno-inconsistent-missing-override
    -Wno-c++1z-extensions
  )
ENDIF()

TARGET_LINK_LIBRARIES(${TARGET} ${JSGROK_LIBRARIES})

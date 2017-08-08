CMAKE_MINIMUM_REQUIRED(VERSION 2.8)

IF(DEFINED CMAKE_BUILD_TYPE)
  SET(CMAKE_BUILD_TYPE ${CMAKE_BUILD_TYPE} CACHE STRING "Choose the type of build, options are: None(CMAKE_CXX_FLAGS or CMAKE_C_FLAGS used) Debug Release RelWithDebInfo MinSizeRel.")
ELSE()
  SET(CMAKE_BUILD_TYPE RelWithDebInfo CACHE STRING "Choose the type of build, options are: None(CMAKE_CXX_FLAGS or CMAKE_C_FLAGS used) Debug Release RelWithDebInfo MinSizeRel.")
ENDIF()

PROJECT(jsgrep)

IF(CMAKE_INSTALL_PREFIX_INITIALIZED_TO_DEFAULT)
  SET(CMAKE_INSTALL_PREFIX ${EXECUTABLE_OUTPUT_PATH} CACHE PATH "jsgrep install prefix" FORCE)
ENDIF()

INCLUDE(CheckIncludeFileCXX)
INCLUDE(CMakeDependentOption)

SET(CMAKE_MODULE_PATH
  ${CMAKE_SOURCE_DIR}
  ${CMAKE_SOURCE_DIR}/cmake/modules
  ${CMAKE_MODULE_PATH}
)

SET(EXECUTABLE_OUTPUT_PATH "${CMAKE_BINARY_DIR}")
SET(LIBRARY_OUTPUT_PATH "${CMAKE_BINARY_DIR}")

ADD_DEFINITIONS("-Wno-unused-result")

# Options
OPTION(JSGREP_BUILD_TESTS "Build the tests" OFF)
OPTION(JSGREP_LINT "Lint the sources" OFF)

FIND_PACKAGE(V8 REQUIRED)

INCLUDE_DIRECTORIES(
  ${V8_INCLUDE_DIR}
  ${CMAKE_SOURCE_DIR}/deps/args/include
  ${CMAKE_SOURCE_DIR}/include
)

SET(JSGREP_SOURCES
  ${CMAKE_SOURCE_DIR}/src/analyzer.cpp
  ${CMAKE_SOURCE_DIR}/src/cli.cpp
  ${CMAKE_SOURCE_DIR}/src/fs.cpp
  ${CMAKE_SOURCE_DIR}/src/reporter.cpp
  ${CMAKE_SOURCE_DIR}/src/v8_compat.cpp
  ${CMAKE_SOURCE_DIR}/src/v8_cluster.cpp
  ${CMAKE_SOURCE_DIR}/src/v8_nodejs_context.cpp
  ${CMAKE_SOURCE_DIR}/src/v8_session.cpp
)

IF(APPLE)
  SET(JSGREP_LIBRARIES
    jsgrep-ql
    ${V8_BASE_LIBRARY}
    ${V8_LIBBASE_LIBRARY}
    ${V8_LIBPLATFORM_LIBRARY}
    ${V8_SNAPSHOT_LIBRARY}
    pthread
  )
ELSE()
  SET(JSGREP_LIBRARIES
    jsgrep-ql
    -Wl,--start-group
    ${V8_BASE_LIBRARY}
    ${V8_LIBBASE_LIBRARY}
    ${V8_LIBPLATFORM_LIBRARY}
    ${V8_SNAPSHOT_LIBRARY}
    ${V8_LIBSAMPLER_LIBRARY}
    -Wl,--end-group
    pthread
  )
ENDIF()

# embed jsgrep-ql
ADD_SUBDIRECTORY(packages/jsgrep-ql)

IF(JSGREP_LINT)
  ADD_CUSTOM_TARGET(
    cppcheck
    ALL
    COMMAND cppcheck
      --std=c++11
      --quiet
      --force
      --enable=all
      --template="[{file}:{line}]: \({severity}\) [{id}] {message}"
      --suppress=missingInclude
      -I ${CMAKE_SOURCE_DIR}/deps
      -I ${CMAKE_SOURCE_DIR}/include
      ${CMAKE_SOURCE_DIR}/include
      ${CMAKE_SOURCE_DIR}/src
    VERBATIM
  )
ENDIF()

ADD_SUBDIRECTORY(src)

IF (JSGREP_BUILD_TESTS)
  ADD_SUBDIRECTORY(test)
ENDIF()

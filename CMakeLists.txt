CMAKE_MINIMUM_REQUIRED(VERSION 2.8)

IF(DEFINED CMAKE_BUILD_TYPE)
  SET(CMAKE_BUILD_TYPE ${CMAKE_BUILD_TYPE} CACHE STRING "Choose the type of build, options are: None(CMAKE_CXX_FLAGS or CMAKE_C_FLAGS used) Debug Release RelWithDebInfo MinSizeRel.")
ELSE()
  SET(CMAKE_BUILD_TYPE RelWithDebInfo CACHE STRING "Choose the type of build, options are: None(CMAKE_CXX_FLAGS or CMAKE_C_FLAGS used) Debug Release RelWithDebInfo MinSizeRel.")
ENDIF()

PROJECT(jsgrok)

IF(CMAKE_INSTALL_PREFIX_INITIALIZED_TO_DEFAULT)
  SET(CMAKE_INSTALL_PREFIX ${EXECUTABLE_OUTPUT_PATH} CACHE PATH "jgrok install prefix" FORCE)
ENDIF()

INCLUDE(CheckIncludeFileCXX)
INCLUDE(CMakeDependentOption)

SET(CMAKE_PREFIX_PATH
  ${CMAKE_PREFIX_PATH}
  ${CMAKE_SOURCE_DIR}/deps/cpplocate
)

SET(CMAKE_MODULE_PATH
  ${CMAKE_SOURCE_DIR}
  ${CMAKE_SOURCE_DIR}/cmake/modules
  ${CMAKE_MODULE_PATH}
)

SET(EXECUTABLE_OUTPUT_PATH "${CMAKE_BINARY_DIR}")
SET(LIBRARY_OUTPUT_PATH "${CMAKE_BINARY_DIR}")

ADD_DEFINITIONS("-Wno-unused-result")

IF(WIN32)
  ADD_DEFINITIONS("-D_CRT_SECURE_NO_WARNINGS")
ENDIF()

IF(UNIX)
  ADD_DEFINITIONS("-DENABLE_BINRELOC")
ENDIF()

IF(APPLE)
  SET(CMAKE_MACOSX_RPATH 1)
ENDIF()

# Options
OPTION(JGROK_BUILD_TESTS    OFF "Build the tests")
OPTION(JGROK_BUILD_EXAMPLES OFF "Build the examples")

FIND_PACKAGE(V8 REQUIRED)
FIND_PACKAGE(cpplocate REQUIRED)

SET(V8_BUILD_DIR "/home/kandie/Downloads/AUR/v8/src/v8/out.gn/x64.release")

INCLUDE_DIRECTORIES(
  ${V8_INCLUDE_DIR}
)

SET(JSGROK_LIBRARIES
  -Wl,--start-group
  ${V8_BUILD_DIR}/obj/libv8_base.a
  ${V8_BUILD_DIR}/obj/libv8_external_snapshot.a
  ${V8_BUILD_DIR}/obj/libv8_libbase.a
  ${V8_BUILD_DIR}/obj/libv8_libplatform.a
  ${V8_BUILD_DIR}/obj/libv8_libsampler.a
  ${V8_BUILD_DIR}/obj/libv8_libsampler.a
  ${V8_BUILD_DIR}/obj/third_party/icu/libicuuc.a
  ${V8_BUILD_DIR}/obj/third_party/icu/libicui18n.a
  ${V8_BUILD_DIR}/obj/src/inspector/libinspector.a
  -Wl,--end-group
  ${cpplocate_DIR}/build/libcpplocate.a
  rt
  dl
  pthread
)

# LINK_DIRECTORIES()

# LINK_LIBRARIES(
#   ${V8_LIBRARY}
#   ${V8_LIBPLATFORM_LIBRARY}
# )

ADD_SUBDIRECTORY(src)

IF (JGROK_BUILD_TESTS)
  ADD_SUBDIRECTORY(test)
ENDIF()

IF (JGROK_BUILD_EXAMPLES)
  ADD_SUBDIRECTORY(examples)
ENDIF()

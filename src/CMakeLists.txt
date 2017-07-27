SET(JGROK_BIN jsgrok)

INCLUDE(GenerateExportHeader)

INCLUDE_DIRECTORIES(../include)
INCLUDE_DIRECTORIES(${CMAKE_BINARY_DIR}/exports)

# TODO: automate / create Findcpplocate.cmake
INCLUDE_DIRECTORIES(${cpplocate_DIR}/source/cpplocate/include)
INCLUDE_DIRECTORIES(${cpplocate_DIR}/build/source/cpplocate/include)
# INCLUDE_DIRECTORIES(${CMAKE_SOURCE_DIR}/deps/simpleopt)

IF(WIN32)
  ADD_DEFINITIONS("/wd4251")
ENDIF()

IF(UNIX)
  SET(CMAKE_CXX_FLAGS "-std=c++0x")
ENDIF()

IF(APPLE)
  SET(CMAKE_CXX_FLAGS "-std=c++11 -Wc++11-extensions -DU_DISABLE_RENAMING=1")

  FIND_LIBRARY(COREFOUNDATION_LIBRARY NAMES CoreFoundation)
  MARK_AS_ADVANCED (COREFOUNDATION_LIBRARY)
ENDIF()

SET(JGROK_SRCS
  analyzer.cpp
  cli.cpp
  fs.cpp
  main.cpp
  v8_cluster.cpp
  v8_nodejs_context.cpp
  v8_session.cpp
)

SET(V8_BUILD_DIR "/home/kandie/Downloads/AUR/v8/src/v8/out.gn/x64.release")

ADD_EXECUTABLE(${JGROK_BIN} ${JGROK_SRCS})

TARGET_LINK_LIBRARIES(${JGROK_BIN}
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

generate_module_info(jsgrok
  VALUES
  name          "jsgrok"
  version       "1.0.0"
  description   "Syntactic JavaScript grep."
  author        "Instructure, INC."

  BUILD_VALUES
  assets_path     "${PROJECT_SOURCE_DIR}/assets"

  INSTALL_VALUES
  assets_path     "\${ModulePath}/assets"
)

export_module_info(jsgrok TARGET jsgrok)

IF(APPLE)
  TARGET_LINK_LIBRARIES(${JGROK_BIN} ${COREFOUNDATION_LIBRARY})
ENDIF()


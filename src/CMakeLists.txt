SET(JGROK_BIN jgrok)

INCLUDE(GenerateExportHeader)

INCLUDE_DIRECTORIES(../include)
INCLUDE_DIRECTORIES(${CMAKE_BINARY_DIR}/exports)

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
  fs.cpp
  main.cpp
  v8_cluster.cpp
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
  rt
  dl
  pthread
)

IF(APPLE)
  TARGET_LINK_LIBRARIES(${JGROK_BIN} ${COREFOUNDATION_LIBRARY})
ENDIF()


SET(JSGROK_BIN jsgrok)

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

SET(V8_BUILD_DIR "/home/kandie/Downloads/AUR/v8/src/v8/out.gn/x64.release")

ADD_EXECUTABLE(${JSGROK_BIN} ${JSGROK_SOURCES} main.cpp)

TARGET_LINK_LIBRARIES(${JSGROK_BIN} ${JSGROK_LIBRARIES})

generate_module_info(jsgrok
  VALUES
  name          "jsgrok"
  version       "1.0.0"
  description   "Syntactic JavaScript grep."
  author        "Instructure, INC."

  BUILD_VALUES
  source_path     "${PROJECT_SOURCE_DIR}"
  assets_path     "${PROJECT_SOURCE_DIR}/assets"

  INSTALL_VALUES
  assets_path     "\${ModulePath}/assets"
)

export_module_info(jsgrok TARGET jsgrok)

IF(APPLE)
  TARGET_LINK_LIBRARIES(${JSGROK_BIN} ${COREFOUNDATION_LIBRARY})
ENDIF()


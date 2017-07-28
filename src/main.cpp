// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fstream>
#include <functional>
#include <algorithm>
#include <pthread.h>
#include <fnmatch.h>
#include <vector>

#include "v8/libplatform/libplatform.h"
#include "v8/v8.h"
#include "jsgrok/types.hpp"
#include "jsgrok/cli.hpp"
#include "jsgrok/fs.hpp"
#include "jsgrok/v8_cluster.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/analyzer.hpp"
#include "jsgrok/functional/partition.hpp"
#include "cpplocate/cpplocate.h"
#include "cpplocate/ModuleInfo.h"

using namespace v8;
using std::any_of;
using jsgrok::string_t;
using jsgrok::v8_session;
using jsgrok::functional::partition_t;

static std::vector<string_t> excluded_dirs({
  "*/node_modules/*"
});

static void grok_files(v8_session *session, void *data) {
  partition_t *files = static_cast<partition_t*>(data);
  partition_t  filtered_files;
  jsgrok::analyzer analyzer;

  for (auto file : *files) {
    if (FNM_NOMATCH == fnmatch(excluded_dirs[0].c_str(), file.c_str(), 0)) {
      filtered_files.push_back(file);
    }
  }

  session->get_isolate()->Enter();

  auto analysis = analyzer.apply(session, filtered_files);

  for (auto error : analysis.errors) {
    printf("[ERROR] %s: %s\n", error.file.c_str(), error.message.c_str());
  }

  for (auto match : analysis.matches) {
    printf("%s:%d: %s\n", match.file.c_str(), match.line, match.match.c_str());
  }

  session->get_isolate()->Exit();
}

int main(int argc, char* argv[]) {
  auto cli = jsgrok::cli();
  auto options = cli.parse(argc, argv);

  if (
    options.state == jsgrok::cli::options_t::CLI_REQUESTED_HELP ||
    options.state == jsgrok::cli::options_t::CLI_PARSE_ERROR
  ) {
    return 1;
  }

  for (auto pattern : options.file_exclusion_patterns) {
    printf("Excluding files that match '%s'\n", pattern.c_str());
  }

  for (auto pattern : options.dir_exclusion_patterns) {
    printf("Excluding dirs that match '%s'\n", pattern.c_str());
  }

  jsgrok::fs fs;

  auto files = options.recursive ?
    fs.recursive_glob(options.file_patterns, 0) :
    fs.glob(options.file_patterns, 0)
  ;

  auto partitions = jsgrok::functional::partition(files, options.threads);

  // Initialize V8.
  V8::InitializeICUDefaultLocation(argv[0]);
  V8::InitializeExternalStartupData(argv[0]);
  Platform* platform = platform::CreateDefaultPlatform();
  V8::InitializePlatform(platform);
  V8::Initialize();

  {
    jsgrok::v8_cluster cluster;

    printf("Scanning %d files for \"%s\"...\n", files.size(), options.search_pattern.c_str());

    for (partition_t &partition : partitions) {
      cluster.spawn(&grok_files, (void*)&partition);
    }

    cluster.clear();
  }

  // Dispose the isolate and tear down V8.
  V8::Dispose();
  V8::ShutdownPlatform();
  delete platform;

  pthread_exit(NULL);

  return 0;
}

// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

#include "v8/libplatform/libplatform.h"
#include "v8/v8.h"
#include <fstream>
#include <functional>
#include <algorithm>
#include "jsgrok/types.hpp"
#include "jsgrok/cli.hpp"
#include "jsgrok/fs.hpp"
#include "jsgrok/v8_cluster.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/analyzer.hpp"
#include "jsgrok/functional/partition.hpp"
#include <pthread.h>
#include "cpplocate/cpplocate.h"
#include "cpplocate/ModuleInfo.h"

using namespace v8;
using std::any_of;
using jsgrok::string_t;
using jsgrok::v8_session;
using jsgrok::functional::partition_t;

static void grok_files(v8_session *session, void *data) {
  partition_t *files = static_cast<partition_t*>(data);
  jsgrok::analyzer *analyzer = new jsgrok::analyzer();
  jsgrok::fs fs;

  Isolate* isolate = session->get_isolate();
  isolate->Enter();

  for (const string_t &file : *files) {
    string_t source_code;

    if (!fs.load_file(file, source_code)) {
      printf("ERROR: unable to read file %s\n", file.c_str());

      continue;
    }

    auto analysis = analyzer->apply(session, file, source_code);

    for (auto error : analysis.errors) {
      printf("[ERROR] %s: %s\n", error.file.c_str(), error.message.c_str());
    }

    for (auto match : analysis.matches) {
      printf("%s:%d: %s\n", match.file.c_str(), match.line, match.match.c_str());
    }
  }

  isolate->Exit();

  delete analyzer;
}

int main(int argc, char* argv[]) {
  // Initialize V8.
  V8::InitializeICUDefaultLocation(argv[0]);
  V8::InitializeExternalStartupData(argv[0]);
  Platform* platform = platform::CreateDefaultPlatform();
  V8::InitializePlatform(platform);
  V8::Initialize();

  jsgrok::fs fs;

  auto cli = jsgrok::cli();
  auto cluster = new jsgrok::v8_cluster();
  auto options = cli.parse(argc, argv);
  int glob_flags = 0;

  if (options.recursive) {
    glob_flags |= jsgrok::fs::GLOB_RECURSIVE;
  }

  auto files = fs.glob(options.patterns, glob_flags);
  auto partitions = jsgrok::functional::partition(files, options.threads);

  for (partition_t &partition : partitions) {
    cluster->spawn(&grok_files, (void*)&partition);
  }

  cluster->clear();

  delete cluster;

  // Dispose the isolate and tear down V8.
  V8::Dispose();
  V8::ShutdownPlatform();
  delete platform;

  pthread_exit(NULL);

  return 0;
}

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
#include <iostream>

#include "v8/libplatform/libplatform.h"
#include "v8/v8.h"
#include "jsgrok/types.hpp"
#include "jsgrok/cli.hpp"
#include "jsgrok/fs.hpp"
#include "jsgrok/v8_cluster.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/analyzer.hpp"
#include "jsgrok/reporter.hpp"
#include "jsgrok/functional/partition.hpp"
#include "jsgrok/functional/filter.hpp"
#include "cpplocate/cpplocate.h"
#include "cpplocate/ModuleInfo.h"

using namespace v8;
using std::any_of;
using std::vector;
using jsgrok::string_t;
using jsgrok::cli;
using jsgrok::v8_session;
using jsgrok::functional::partition_t;
using options_t = jsgrok::cli::options_t;

typedef struct {
  partition_t     *partition;
  cli::options_t  *options;
} job_t;

static void grok_files(v8_session *session, void *data) {
  job_t *job = static_cast<job_t*>(data);

  partition_t *files = job->partition;
  options_t *options = job->options;
  partition_t  filtered_files(
    jsgrok::functional::filter(
      *files,
      options->file_inclusion_patterns,
      options->file_exclusion_patterns,
      options->dir_exclusion_patterns
    )
  );

  if (options->verbosity == options_t::VERBOSITY_DEBUG) {
    printf("[D] Scanning %d files...\n", filtered_files.size());
  }

  session->get_isolate()->Enter();

  jsgrok::analyzer analyzer;

  auto analysis = analyzer.apply(session, filtered_files);
  auto reporter = jsgrok::reporter(*options);

  reporter.report(analysis, std::cout);

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

  jsgrok::fs fs;

  if (options.verbosity == options_t::VERBOSITY_DEBUG) {
    printf("[D] Using %d V8 instances.\n", options.threads);
  }

  auto files = options.recursive ?
    fs.recursive_glob(options.file_patterns, 0) :
    fs.glob(options.file_patterns, 0)
  ;

  auto partitions = jsgrok::functional::partition(files, options.threads);
  vector<job_t*> jobs(partitions.size());

  // Initialize V8.
  V8::InitializeICUDefaultLocation(argv[0]);
  V8::InitializeExternalStartupData(argv[0]);
  Platform* platform = platform::CreateDefaultPlatform();
  V8::InitializePlatform(platform);
  V8::Initialize();

  {
    jsgrok::v8_cluster cluster;

    for (partition_t &partition : partitions) {
      job_t *job = new job_t({ &partition, &options });
      jobs.push_back(job);

      cluster.spawn(&grok_files, (void*)job);
    }

    cluster.clear();
  }

  for (job_t *job : jobs) {
    delete job;
  }

  jobs.clear();

  // Dispose the isolate and tear down V8.
  V8::Dispose();
  V8::ShutdownPlatform();
  delete platform;

  pthread_exit(NULL);

  return 0;
}

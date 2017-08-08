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

#include "libplatform/libplatform.h"
#include "v8.h"
#include "jsgrep/types.hpp"
#include "jsgrep/cli.hpp"
#include "jsgrep/fs.hpp"
#include "jsgrep/v8_compat.hpp"
#include "jsgrep/v8_cluster.hpp"
#include "jsgrep/v8_session.hpp"
#include "jsgrep/analyzer.hpp"
#include "jsgrep/reporter.hpp"
#include "jsgrep/functional/partition.hpp"
#include "jsgrep/functional/filter.hpp"

using namespace v8;
using std::any_of;
using std::vector;
using jsgrep::string_t;
using jsgrep::cli;
using jsgrep::v8_session;
using jsgrep::functional::partition_t;
using options_t = jsgrep::cli::options_t;

typedef struct {
  partition_t     *partition;
  cli::options_t  *options;
} job_t;

static void grok_files(v8_session *session, void *data) {
  job_t *job = static_cast<job_t*>(data);

  partition_t *files = job->partition;
  options_t *options = job->options;
  partition_t  filtered_files(
    jsgrep::functional::filter(
      *files,
      options->file_inclusion_patterns,
      options->file_exclusion_patterns,
      options->dir_exclusion_patterns
    )
  );

  if (options->verbosity == options_t::VERBOSITY_DEBUG) {
    printf("[D] Scanning %d files...\n", (int)filtered_files.size());
  }

  session->get_isolate()->Enter();

  jsgrep::analyzer analyzer;

  auto analysis = analyzer.apply(session, options->query, filtered_files);
  auto reporter = jsgrep::reporter(*options);

  reporter.report(analysis, std::cout);

  session->get_isolate()->Exit();
}

int main(int argc, char* argv[]) {
  auto cli = jsgrep::cli();
  auto options = cli.parse(argc, argv);

  if (
    options.state == jsgrep::cli::options_t::CLI_REQUESTED_HELP ||
    options.state == jsgrep::cli::options_t::CLI_PARSE_ERROR
  ) {
    return 1;
  }

  jsgrep::fs fs;

  if (options.verbosity == options_t::VERBOSITY_DEBUG) {
    printf("[D] Using %d V8 instances.\n", options.threads);
  }

  auto files = options.recursive ?
    fs.recursive_glob(options.file_patterns, 0) :
    fs.glob(options.file_patterns, 0)
  ;

  auto partitions = jsgrep::functional::partition(files, options.threads);
  vector<job_t*> jobs(partitions.size());

  // Initialize V8.
  jsgrep::v8_compat::initialize(argc, argv);

  {
    jsgrep::v8_cluster cluster;

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

  jsgrep::v8_compat::teardown();

  pthread_exit(NULL);

  return 0;
}

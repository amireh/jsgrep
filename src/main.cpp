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
#include "jsgrok/v8_cluster.hpp"
#include "jsgrok/v8_session.hpp"
#include "jsgrok/analyzer.hpp"
#include <pthread.h>
#include "cpplocate/cpplocate.h"
#include "cpplocate/ModuleInfo.h"

using namespace v8;
using std::any_of;
using jsgrok::string_t;

static const string_t source_code("\
  var x = 1; \
  var y = 2; \
  var z = {  \
    a: '1'   \
  }          \
");

static void do_work(jsgrok::v8_session *session) {
  // Create a new Isolate and make it the current one.
  jsgrok::analyzer *analyzer = new jsgrok::analyzer();
  Isolate* isolate = session->get_isolate();

  isolate->Enter();
  auto results = analyzer->apply(session, source_code);

  printf("%d results\n", results.size());

  int i = 0;

  for (auto result : results) {
    if (!result.IsEmpty()) {
      printf("\t%d. %s\n", ++i, *String::Utf8Value(result));
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

  printf("Exec path=%s\n", cpplocate::getExecutablePath().c_str());
  printf("Bundle path=%s\n", cpplocate::getBundlePath().c_str());
  printf("Module path=%s\n", cpplocate::getModulePath().c_str());
  printf("Module path=%s\n", cpplocate::findModule("jsgrok").value("assets_path").c_str());

  auto cluster = new jsgrok::v8_cluster();

  cluster->spawn(&do_work);
  cluster->spawn(&do_work);
  cluster->spawn(&do_work);
  cluster->clear();

  delete cluster;

  // Dispose the isolate and tear down V8.
  V8::Dispose();
  V8::ShutdownPlatform();
  delete platform;

  pthread_exit(NULL);

  return 0;
}

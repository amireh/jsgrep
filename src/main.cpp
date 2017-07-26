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
#include "jsgrok/v8_session.hpp"
#include "jsgrok/analyzer.hpp"

using namespace v8;
using std::any_of;
using jsgrok::string_t;

int main(int argc, char* argv[]) {
  string_t source_code("var x = 1; var y = 2;");

  // Initialize V8.
  V8::InitializeICUDefaultLocation(argv[0]);
  V8::InitializeExternalStartupData(argv[0]);
  Platform* platform = platform::CreateDefaultPlatform();
  V8::InitializePlatform(platform);
  V8::Initialize();

  // Create a new Isolate and make it the current one.
  jsgrok::v8_session *session = new jsgrok::v8_session();
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

  // Dispose the isolate and tear down V8.
  delete analyzer;
  delete session;
  V8::Dispose();
  V8::ShutdownPlatform();
  delete platform;

  return 0;
}

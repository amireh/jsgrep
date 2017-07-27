#include "jsgrok/cli.hpp"
#include "jsgrok/fs.hpp"
// #include "SimpleOpt.h"
#include "cpplocate/ModuleInfo.h"
#include <glob.h>

// #if defined(_MSC_VER)
// # include <windows.h>
// # include <tchar.h>
// #else
// # define TCHAR    char
// # define _T(x)    x
// # define _tprintf printf
// # define _tmain   main
// # define _ttoi      atoi
// #endif

namespace jsgrok {
  cli::cli()
  {
  }

  cli::~cli() {
  }

  cli::options_t cli::parse(int argc, char** argv) {
    options_t options;
    jsgrok::fs fs;

    options.recursive = false; // TODO
    options.threads = 5;

    for (int i = 1; i < argc; ++i) {
      options.patterns.push_back(string_t(argv[i]));
    }

    return options;
  }
}
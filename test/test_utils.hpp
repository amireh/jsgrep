#ifndef H_JSGROK_TEST_UTILS_H
#define H_JSGROK_TEST_UTILS_H

namespace jsgrok {
  typedef struct {
    int  argc;
    char **argv;
  } test_config_t;

  extern test_config_t test_config;
}

#endif
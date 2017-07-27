#ifndef H_JSGROK_CLI_H
#define H_JSGROK_CLI_H

#include "jsgrok/types.hpp"
#include <vector>

namespace jsgrok {
  using std::vector;
  using jsgrok::string_t;

  class cli {
  public:
    typedef struct {
      vector<string_t>  patterns;
      bool              recursive;
      uint32_t          threads;
    } options_t;

    cli();
    virtual ~cli();

    virtual options_t parse(int argc, char** argv);

  protected:
  };

} // end of namespace jsgrok

#endif

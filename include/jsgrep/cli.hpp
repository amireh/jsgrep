#ifndef H_JSGREP_CLI_H
#define H_JSGREP_CLI_H

#include <vector>
#include <functional>
#include "jsgrep/types.hpp"

namespace args {
  class ArgumentParser;
}

namespace jsgrep {
  using std::vector;
  using jsgrep::string_t;

  class cli {
  public:
    typedef struct {
      enum {
        CLI_OK = 0,
        CLI_REQUESTED_HELP = 1,
        CLI_PARSE_ERROR = 2,
      } state;

      enum {
        VERBOSITY_QUIET = 0,
        VERBOSITY_INFO  = 1,
        VERBOSITY_DEBUG = 2
      } verbosity;

      // scan control:
      string_t          query;
      vector<string_t>  file_patterns;
      vector<string_t>  file_inclusion_patterns;
      vector<string_t>  file_exclusion_patterns;
      vector<string_t>  dir_exclusion_patterns;
      bool              recursive;
      uint32_t          threads;

      // output control:
      bool              print_line_numbers = false;
      bool              print_filename = true;
      bool              print_match = true;
      bool              colorize = true;
    } options_t;

    cli();
    virtual ~cli();

    options_t parse(int argc, char** argv) const;
    options_t parse(vector<string_t> const&) const;

  protected:
    typedef std::function<void(args::ArgumentParser&)> applier_t;

    options_t parse(applier_t) const;
  };

} // end of namespace jsgrep

#endif

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
      string_t          search_pattern;
      vector<string_t>  file_patterns;
      vector<string_t>  file_inclusion_patterns;
      vector<string_t>  file_exclusion_patterns;
      vector<string_t>  dir_exclusion_patterns;
      bool              recursive;
      uint32_t          threads;

      // output control:
      bool              print_line_numbers;
      bool              suppress_filename;
      bool              print_filename;
      bool              print_matching_filenames;
      bool              colorize;
    } options_t;

    cli();
    virtual ~cli();

    virtual options_t parse(int argc, char** argv);

  protected:
  };

} // end of namespace jsgrok

#endif

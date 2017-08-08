#ifndef H_JSGREP_FS_H
#define H_JSGREP_FS_H

#include "jsgrep/types.hpp"
#include <vector>

namespace jsgrep {
  using std::vector;

  class fs {
  public:
    typedef string_t file_t;

    enum { GLOB_RECURSIVE = 0x1 };

    explicit fs();
    virtual ~fs();

    /** Loads the content of a file stream into memory */
    bool load_file(std::ifstream &fs, string_t& out_buf) const;

    /** Loads the content of a file found at @path into memory */
    bool load_file(string_t const& path, string_t& out_buf) const;

    vector<file_t> glob(vector<string_t> const& patterns, int opts = 0);
    vector<file_t> recursive_glob(vector<string_t> const&, int = 0);
  };

} // end of namespace jsgrep

#endif

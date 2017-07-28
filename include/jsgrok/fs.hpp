#ifndef H_JSGROK_FS_H
#define H_JSGROK_FS_H

#include "jsgrok/types.hpp"
#include "cpplocate/ModuleInfo.h"
#include <vector>

namespace jsgrok {
  using std::vector;

  class fs {
  public:
    typedef string_t file_t;

    enum { GLOB_RECURSIVE = 0x1 };

    fs(string_t = "jsgrok");
    virtual ~fs();

    /** Loads the content of a file stream into memory */
    bool load_file(std::ifstream &fs, string_t& out_buf) const;

    /** Loads the content of a file found at @path into memory */
    bool load_file(string_t const& path, string_t& out_buf) const;

    path_t resolve(string_t const& group, string_t const&) const;
    path_t resolve_asset(string_t const&) const;

    vector<file_t> glob(vector<string_t> const& patterns, int opts = 0);
    vector<file_t> recursive_glob(vector<string_t> const&, int = 0);

  protected:
    cpplocate::ModuleInfo module_info_;
  };

} // end of namespace jsgrok

#endif

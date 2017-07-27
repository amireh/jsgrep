#ifndef H_JSGROK_FS_H
#define H_JSGROK_FS_H

#include "jsgrok/types.hpp"
#include "cpplocate/ModuleInfo.h"

namespace jsgrok {
  class fs {
  public:
    fs(string_t = "jsgrok");
    virtual ~fs();

    /** Loads the content of a file stream into memory */
    virtual bool load_file(std::ifstream &fs, string_t& out_buf) const;

    /** Loads the content of a file found at @path into memory */
    virtual bool load_file(string_t const& path, string_t& out_buf) const;

    virtual path_t resolve(string_t const& group, string_t const&) const;
    virtual path_t resolve_asset(string_t const&) const;

  protected:
    cpplocate::ModuleInfo module_info_;
  };

} // end of namespace jsgrok

#endif

#ifndef H_JSGROK_FS_H
#define H_JSGROK_FS_H

#include "jsgrok/types.hpp"

namespace jsgrok {
  class fs {
  public:
    fs();
    virtual ~fs();

    /** Loads the content of a file stream into memory */
    virtual bool load_file(std::ifstream &fs, string_t& out_buf) const;

    /** Loads the content of a file found at @path into memory */
    virtual bool load_file(string_t const& path, string_t& out_buf) const;
  };

} // end of namespace jsgrok

#endif

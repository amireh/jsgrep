#include "jsgrok/fs.hpp"
#include <fstream>
#include "cpplocate/cpplocate.h"
#include "cpplocate/ModuleInfo.h"

namespace jsgrok {
  fs::fs(string_t library_name)
  : module_info_(cpplocate::findModule(library_name))
  {
  }

  fs::~fs() {
  }

  bool fs::load_file(std::ifstream &fs, string_t& out_buf) const
  {
    if (!fs.is_open() || !fs.good()) return false;

    while (fs.good()) {
      out_buf.push_back(fs.get());
    }

    out_buf.erase(out_buf.size()-1,1);

    return true;
  }

  bool fs::load_file(string_t const& path, string_t& out_buf) const
  {
    bool rc;
    std::ifstream fs(path.c_str());

    try {
      rc = load_file(fs, out_buf);
    }
    catch(...) {
      fs.close();
      throw;
    }

    fs.close();

    return rc;
  }

  path_t fs::resolve(string_t const& group, string_t const& path) const {
    path_t base_path(module_info_.value(group));
    return base_path + "/" + path;
  }

  path_t fs::resolve_asset(string_t const& path) const {
    path_t assets_path(module_info_.value("assets_path"));

    return assets_path + "/" + path;
  }
}
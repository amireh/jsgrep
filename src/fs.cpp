#include <fstream>
#include <glob.h>
#include <ftw.h>
#include "jsgrep/fs.hpp"

namespace jsgrep {
  fs::fs()
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

  vector<fs::file_t> fs::glob(vector<string_t> const &patterns, int flags) {
    vector<file_t> out;

    for (auto pattern : patterns) {
      glob_t globbuf;

      int glob_err = ::glob(pattern.c_str(), GLOB_NOSORT | GLOB_MARK | GLOB_BRACE, NULL, &globbuf);

      if (glob_err == 0) {
        for (size_t i = 0; i < globbuf.gl_pathc; i++) {
          out.push_back(string_t(globbuf.gl_pathv[i]));
        }
      }

      globfree(&globbuf);
    }

    return out;
  }

  vector<fs::file_t> fs::recursive_glob(vector<string_t> const &patterns, int flags) {
    static vector<file_t> out;

    auto callback = [](const char *filepath, const struct stat*, int type) -> int {
      if (type == FTW_F) {
        out.push_back(string_t(filepath));
      }

      return 0;
    };

    for (auto pattern : patterns) {
      ftw(pattern.c_str(), callback, 16);
    }

    return out;
  }
}
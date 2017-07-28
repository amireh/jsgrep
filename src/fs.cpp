#include "jsgrok/fs.hpp"
#include <fstream>
#include "cpplocate/cpplocate.h"
#include "cpplocate/ModuleInfo.h"
#include <glob.h>
#include <fts.h>
#include <ftw.h>
#include <cstring>
#include <algorithm>

namespace jsgrok {
  static bool ends_with(string_t const& substring, string_t const &string) {
    return (
      string.size() >= substring.size() &&
      string.compare(
        string.size() - substring.size(),
        substring.size(),
        substring
      ) == 0
    );
  }

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

  vector<fs::file_t> fs::glob(vector<string_t> const &patterns, int flags) {
    vector<file_t> out;
    vector<string_t> legit_patterns;

    for (auto pattern : patterns) {
      if (flags & GLOB_RECURSIVE == GLOB_RECURSIVE && ends_with("/", pattern)) {
        legit_patterns.push_back(pattern + "/**/*");
      }
      else {
        legit_patterns.push_back(pattern);
      }
    }

    for (auto pattern : legit_patterns) {
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

  char *convert(const std::string & s) {
    char *pc = new char[s.size()+1];
    std::strcpy(pc, s.c_str());
    return pc;
  }

  vector<fs::file_t> fs::recursive_glob(vector<string_t> const &patterns, int flags) {
    static vector<file_t> out;

    auto callback = [](const char *filepath, const struct stat*, int type) -> int {
      if (type == FTW_F && ends_with(".js", filepath)) {
        out.push_back(string_t(filepath));
      }

      return 0;
    };

    for (auto pattern : patterns) {
      ftw(pattern.c_str(), callback, 16);
    }

    return out;
  }

  // vector<fs::file_t> fs::recursive_glob(vector<string_t> const &patterns, int flags) {
  //   vector<file_t> out;
  //   vector<string_t> legit_patterns;
  //   std::vector<char*> paths;

  //   auto die = [&]() {
  //     for (char *path : paths) {
  //       delete [] path;
  //     }

  //     paths.clear();

  //     return out;
  //   };

  //   if (patterns.empty()) {
  //     return die();
  //   }

  //   std::transform(patterns.begin(), patterns.end(), std::back_inserter(paths), convert);

  //   FTS *tree = fts_open(&paths[0], FTS_NOCHDIR, 0);

  //   if (!tree) {
  //     printf("[ERROR] fts_open\n");
  //     return out;
  //   }

  //   FTSENT *node;

  //   while ((node = fts_read(tree))) {
  //     if (node->fts_level > 0 && node->fts_name[0] == '.') {
  //       fts_set(tree, node, FTS_SKIP);
  //     }
  //     else if (node->fts_info & FTS_F) {
  //       out.push_back(string_t(node->fts_path));
  //     }
  //   }

  //   if (fts_close(tree)) {
  //     printf("[ERROR] fts_close\n");
  //     return die();
  //   }

  //   return die();
  // }
}
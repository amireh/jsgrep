#ifndef H_JSGROK_FUNCTIONAL_FILTER_H
#define H_JSGROK_FUNCTIONAL_FILTER_H

#include "jsgrok/types.hpp"
#include <algorithm>
#include <vector>
#include <math.h>
#include <fnmatch.h>

namespace jsgrok {
  namespace functional {
    using std::vector;

    typedef vector<string_t> patterns_t;

    static bool matches(const string_t& pattern, const string_t &string) {
      return 0 == fnmatch(pattern.c_str(), string.c_str(), 0);
    }

    static bool matches_any(const patterns_t& patterns, const string_t& string) {
      for (const auto pattern : patterns) {
        if (matches(pattern, string)) {
          return true;
        }
      }

      return false;
    }

    static const vector<string_t> EXCLUDE_NONE;
    static const vector<string_t> INCLUDE_ALL({ "*" });
    static const vector<string_t> INCLUDE_JS_FILES({ "*.js", "*.jsx" });
    static vector<string_t> filter(
      vector<string_t> const &files,
      vector<string_t> const &file_includes = INCLUDE_ALL,
      vector<string_t> const &file_excludes = EXCLUDE_NONE,
      vector<string_t> const &dir_excludes = EXCLUDE_NONE
    )
    {
      vector<string_t> fnmatch_dir_excludes;

      for (const auto pattern : dir_excludes) {
        fnmatch_dir_excludes.push_back("*" + string_t(pattern) + "/*");
      }

      vector<string_t> included_files;

      std::copy_if(
        files.begin(),
        files.end(),
        std::back_inserter(included_files),
        [&](const string_t &file) {
          return (
            !matches_any(file_excludes, file) &&
            !matches_any(fnmatch_dir_excludes, file) &&
            matches_any(file_includes, file)
          );
        }
      );

      return included_files;
    }
  } // end of namespace functional
} // end of namespace jsgrok

#endif

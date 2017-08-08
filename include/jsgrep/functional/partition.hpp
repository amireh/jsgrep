#ifndef H_JSGREP_FUNCTIONAL_PARTITION_H
#define H_JSGREP_FUNCTIONAL_PARTITION_H

#include "jsgrep/types.hpp"
#include <vector>
#include <math.h>

namespace jsgrep {
  namespace functional {
    using std::vector;

    typedef vector<string_t> partition_t;

    static vector<partition_t> partition(vector<string_t> list, uint32_t partitions) {
      uint32_t item_count = list.size();

      vector<partition_t> out(partitions);

      for (uint32_t cursor = 0; cursor < item_count; ++cursor) {
        out[cursor % partitions].push_back(list[cursor]);
      }

      return out;
    }
  } // end of namespace functional
} // end of namespace jsgrep

#endif

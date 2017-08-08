#ifndef H_JSGREP_FUNCTIONAL_COLORIZE_H
#define H_JSGREP_FUNCTIONAL_COLORIZE_H

#include "jsgrep/types.hpp"
#include <vector>
#include <math.h>

namespace jsgrep {
  namespace functional {
    typedef enum {
      Red = 31,
      Green = 32,
      Blue = 34,
      Magenta = 35,
    } Color;

    static string_t colorize(Color color, const string_t& string) {
      if (color == Red) {
        return "\033[31m" + string + "\033[0m";
      }
      else if (color == Green) {
        return "\033[32m" + string + "\033[0m";
      }
      else if (color == Blue) {
        return "\033[34m" + string + "\033[0m";
      }
      else if (color == Magenta) {
        return "\033[35m" + string + "\033[0m";
      }
      else {
        return string;
      }
    }
  } // end of namespace functional
} // end of namespace jsgrep

#endif

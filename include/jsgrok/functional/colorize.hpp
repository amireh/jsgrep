#ifndef H_JSGROK_FUNCTIONAL_COLORIZE_H
#define H_JSGROK_FUNCTIONAL_COLORIZE_H

#include "jsgrok/types.hpp"
#include <vector>
#include <math.h>

namespace jsgrok {
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
    }
  } // end of namespace functional
} // end of namespace jsgrok

#endif

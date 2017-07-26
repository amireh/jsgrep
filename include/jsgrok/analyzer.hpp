#ifndef H_JSGROK_ANALYZER_H
#define H_JSGROK_ANALYZER_H

#include "jsgrok/types.hpp"
#include "v8/v8.h"
#include <vector>

namespace jsgrok {
  using v8::Local;
  using v8::Value;
  using std::vector;

  class v8_session;
  class analyzer {
  public:
    typedef vector<Local<Value>> analysis_t;

    analyzer();
    virtual ~analyzer();

    analysis_t apply(v8_session*, string_t const&);
  };

} // end of namespace jsgrok

#endif

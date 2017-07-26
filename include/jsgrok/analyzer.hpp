#ifndef H_JSGROK_ANALYZER_H
#define H_JSGROK_ANALYZER_H

#include "jsgrok/types.hpp"
#include "v8/v8.h"

namespace jsgrok {
  using v8::MaybeLocal;
  using v8::Value;

  class v8_session;
  class analyzer {
  public:
    analyzer();
    virtual ~analyzer();

    MaybeLocal<Value> apply(v8_session*, string_t const&);
  };

} // end of namespace jsgrok

#endif

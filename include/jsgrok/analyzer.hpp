#ifndef H_JSGROK_ANALYZER_H
#define H_JSGROK_ANALYZER_H

#include "jsgrok/types.hpp"
#include "v8/v8.h"
#include <vector>

namespace jsgrok {
  using v8::Context;
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

  protected:
    void prepare_context(v8_session*, Local<Context>&);
    analysis_t aggregate_results(Local<Context>&, analysis_t const&) const;

    static void require(const v8::FunctionCallbackInfo<Value> &);

    Local<Context> *context_;
    v8_session     *session_;
  };

} // end of namespace jsgrok

#endif

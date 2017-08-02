#ifndef H_JSGROK_ANALYZER_H
#define H_JSGROK_ANALYZER_H

#include <vector>
#include "v8/v8.h"
#include "jsgrok/types.hpp"

namespace jsgrok {
  using v8::Context;
  using v8::Local;
  using v8::Value;
  using std::vector;

  class v8_session;
  class v8_module;
  class analyzer {
  public:
    enum {
      SourceCodeError = 1,
      SearchError = 2,
      QueryError = 3,
    };

    typedef struct {
      string_t file;
      string_t message;
      uint32_t error_type;
    } analysis_error_t;

    typedef struct {
      string_t file;
      string_t match;
      uint32_t line;
      uint32_t start;
      uint32_t end;
    } analysis_match_t;

    typedef struct {
      vector<analysis_error_t> errors;
      vector<analysis_match_t> matches;
    } analysis_t;

    analyzer();
    virtual ~analyzer();

    analysis_t apply(v8_session*, string_t const& query, vector<string_t> const& files) const;

  protected:
    typedef struct {
      string_t     file;
      Local<Value> value;
    } js_match_t;

    typedef vector<js_match_t> js_analysis_t;

    js_analysis_t aggregate_results(Local<Context>&, js_analysis_t const&) const;
    analysis_t    cast_down(v8_session*, Local<Context>&, js_analysis_t const&) const;
  };

} // end of namespace jsgrok

#endif

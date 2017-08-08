#ifndef H_JSGREP_V8_MODULE_H
#define H_JSGREP_V8_MODULE_H

#include "v8.h"

namespace jsgrep {
  struct v8_module {
    v8::Handle<v8::Value> exports;
    v8::Exception *script_error;

    enum {
      EC_OK = 0,
      EC_ISOLATE_NOT_ENTERED = 1,
      EC_CONTEXT_NOT_DEFINED = 2,
      EC_FILE_ERROR = 3,
      EC_NO_EXPORTS = 4,
      EC_SCRIPT_ERROR = 5,
    } status;

    inline bool operator==(int expected_status) {
      return status == expected_status;
    }

    inline bool operator!=(int expected_status) {
      return status != expected_status;
    }

    inline bool operator!() {
      return status != EC_OK;
    }
  };
}

#endif
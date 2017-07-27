#ifndef H_JSGROK_V8_CLUSTER_H
#define H_JSGROK_V8_CLUSTER_H

#include "jsgrok/types.hpp"
#include <vector>
#include <functional>
#include <pthread.h>

namespace jsgrok {
  using std::vector;

  class v8_session;
  class v8_cluster {
  public:
    typedef std::function<void(v8_session*)> worker_t;

    v8_cluster();
    virtual ~v8_cluster();

    void spawn(worker_t);
    unsigned int session_count();
    void clear();

  protected:
    typedef struct {
      v8_cluster *cluster;
      worker_t   *worker;
    } spawn_request_t;

    vector<pthread_t*>  threads_;
    pthread_mutex_t     sessions_lock_;
    vector<v8_session*> sessions_;

    static void* spawn_session_in_background(void *);
  };
}

#endif
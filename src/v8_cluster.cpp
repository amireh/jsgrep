#include "jsgrok/v8_cluster.hpp"
#include "jsgrok/v8_session.hpp"

namespace jsgrok {
  v8_cluster::v8_cluster() : sessions_({}) {
    pthread_mutex_init(&sessions_lock_, NULL);
  };

  v8_cluster::~v8_cluster() {
    pthread_mutex_destroy(&sessions_lock_);
  };

  void v8_cluster::spawn(worker_t worker, void *data) {
    auto thread = new pthread_t();
    auto spawn_request = new spawn_request_t({
      this,
      &worker,
      data
    });

    pthread_attr_t attr;
    pthread_attr_init(&attr);
    pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_JOINABLE);

    auto rc = pthread_create(
      thread,
      &attr,
      spawn_session_in_background,
      spawn_request
    );

    pthread_attr_destroy(&attr);

    if (rc) {
      printf("Unable to spawn thread! %d\n", rc);
      delete thread;
    }
    else {
      threads_.push_back(thread);
    }
  }

  unsigned int v8_cluster::session_count() {
    unsigned int count;

    pthread_mutex_lock(&sessions_lock_);
    count = sessions_.size();
    pthread_mutex_unlock(&sessions_lock_);

    return count;
  }

  void* v8_cluster::spawn_session_in_background(void *spawn_request_on_the_bus) {
    spawn_request_t *spawn_request = reinterpret_cast<spawn_request_t*>(spawn_request_on_the_bus);
    v8_cluster      *cluster = spawn_request->cluster;
    worker_t        *worker = spawn_request->worker;
    void            *data   = spawn_request->data;

    delete spawn_request;

    jsgrok::v8_session *session = new jsgrok::v8_session();

    pthread_mutex_lock(&cluster->sessions_lock_);
    cluster->sessions_.push_back(session);
    pthread_mutex_unlock(&cluster->sessions_lock_);

    (*worker)(session, data);

    pthread_exit(NULL);
  }

  void v8_cluster::clear() {
    for (pthread_t *thread : threads_) {
      pthread_join(*thread, NULL);
      delete thread;
    }

    threads_.clear();

    pthread_mutex_lock(&sessions_lock_);

    for (v8_session *session : sessions_) {
      delete session;
    }

    sessions_.clear();

    pthread_mutex_unlock(&sessions_lock_);
  }
}
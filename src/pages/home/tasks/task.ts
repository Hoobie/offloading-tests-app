import * as Rx from 'rxjs';

export class Task {
  observable: Rx.Observable<void>;
  durationMs: number;

  constructor(observable: Rx.Observable<void>, durationMs: number) {
    this.observable = observable
      .observeOn(Rx.Scheduler.async)
      .subscribeOn(Rx.Scheduler.async);
    this.durationMs = durationMs;
  }

  public run(): Rx.Observable<void> {
    let t = this;
    return Rx.Observable.create(function(observer) {
      let now = Date.now();
      let timeout;

      let onCompleteCallback = function() {
        if (Date.now() < now + t.durationMs) {
          let sub = t.observable.subscribe(function(data) { }, function(err) { }, onCompleteCallback);
          clearTimeout(timeout);
          timeout = setTimeout(function() {
            sub.unsubscribe();
            observer.complete();
          }, t.durationMs);
        } else {
          clearTimeout(timeout);
          console.debug("The task is done")
          observer.complete();
        }
      };
      onCompleteCallback();
    }).subscribeOn(Rx.Scheduler.async).observeOn(Rx.Scheduler.async);
  }
}

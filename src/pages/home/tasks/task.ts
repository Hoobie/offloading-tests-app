import * as Rx from 'rxjs';

export class Task {
  observable;
  durationMs;

  constructor(observable: () => Rx.Observable<void>, durationMs: number) {
    this.observable = observable;
    this.durationMs = durationMs;
  }

  public run(): Rx.Observable<void> {
    let t = this;
    return Rx.Observable.create(function(observer) {
      let now = Date.now();

      let onCompleteCallback = function() {
        if (Date.now() < now + t.durationMs) {
          let sub = t.observable.subscribe(function(data) { }, function(err) { }, onCompleteCallback);
          setTimeout(function() {
            sub.dispose();
            observer.complete();
          }, now - t.durationMs);
        } else {
          console.debug("The task is done")
          observer.complete();
        }
      };
      onCompleteCallback();
    });
  }
}

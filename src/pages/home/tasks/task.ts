import * as Rx from 'rxjs';

export class Task {
  observable: Rx.Observable<void>;
  count: number;

  constructor(observable: Rx.Observable<void>, count: number) {
    this.observable = observable
      .observeOn(Rx.Scheduler.async)
      .subscribeOn(Rx.Scheduler.async);
    this.count = count;
  }

  public run(): Rx.Observable<void> {
    let t = this;
    let i = 0;
    return Rx.Observable.create(function(observer) {
      let onCompleteCallback = function() {
        if (i < t.count) {
          t.observable.subscribe(function(data) { }, function(err) { }, onCompleteCallback);
          i++;
          observer.next();
        } else {
          console.debug("The task is done")
          observer.complete();
        }
      };
      onCompleteCallback();
    }).subscribeOn(Rx.Scheduler.async).observeOn(Rx.Scheduler.async);
  }
}

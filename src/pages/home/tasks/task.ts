import * as Rx from 'rxjs';

export class Task {

  constructor(public observable: Rx.Observable<void>, public count: number) {
    this.observable = observable
      .observeOn(Rx.Scheduler.async)
      .subscribeOn(Rx.Scheduler.async);
    this.count = count;
  }

  public run(): Rx.Observable<void> {
    let t = this;
    var i = 0;
    return Rx.Observable.create(function(observer) {
      let onCompleteCallback = function() {
        if (i < t.count) {
          t.observable.subscribe(
            function(data) { },
            function(err) { },
            function() {
              observer.next();
              i++;
              onCompleteCallback();
            });
        } else {
          console.log("The task is done");
          observer.complete();
        }
      };
      onCompleteCallback();
    }).subscribeOn(Rx.Scheduler.async).observeOn(Rx.Scheduler.async);
  }
}

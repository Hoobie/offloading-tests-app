import * as Rx from 'rxjs';

export class Task {

  constructor(public observable: Rx.Observable<void>) {
    if (observable) {
      observable = observable
        .observeOn(Rx.Scheduler.async)
        .subscribeOn(Rx.Scheduler.async);
    }
  }
}

import {Task} from "./task";
import * as Rx from 'rxjs';

export class TasksRunner {

  tasks: Task[];

  constructor(tasks: Task[]) {
    this.tasks = tasks;
  }

  public runAll(): Rx.Observable<void> {
    let tasksCopy = this.tasks.slice();

    return Rx.Observable.create(function(observer) {
      let onCompleteCallback = function() {
        if (tasksCopy.length > 0) {
          tasksCopy.shift().observable.subscribe(
            function(data) { },
            function(err) {
              observer.error(err);
            },
            function() {
              console.log("The task is done")
              observer.next();
              onCompleteCallback();
            });
        } else {
          console.log("All the tasks are done");
          observer.complete();
        }
      };
      onCompleteCallback();
    }).subscribeOn(Rx.Scheduler.asap).observeOn(Rx.Scheduler.asap);
  }
}

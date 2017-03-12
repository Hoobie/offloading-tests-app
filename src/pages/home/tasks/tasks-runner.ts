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
          tasksCopy.shift().run().subscribe(
            function(data) {
              observer.next();
            },
            function(err) {
              observer.error();
            },
            function() {
              onCompleteCallback();
            });
        } else {
          console.log("All the tasks are done");
          observer.complete();
        }
      };
      onCompleteCallback();
    }).subscribeOn(Rx.Scheduler.async).observeOn(Rx.Scheduler.async);
  }
}

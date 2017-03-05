import {Task} from "./task";
import * as Rx from 'rxjs';

export class TasksRunner {

  tasks: Task[];

  constructor(tasks: Task[]) {
    this.tasks = tasks;
  }

  public runAll(): Rx.Observable<void> {
    let tasks = this.tasks;

    return Rx.Observable.create(function(observer) {
      let onCompleteCallback = function() {
        if (tasks.length > 0) {
          tasks.shift().run().subscribe(function(data) { }, function(err) { }, function() { observer.next(); onCompleteCallback(); });
        } else {
          console.log("All the tasks are done");
          observer.complete();
        }
      };
      onCompleteCallback();
    }).subscribeOn(Rx.Scheduler.async).observeOn(Rx.Scheduler.async);
  }
}

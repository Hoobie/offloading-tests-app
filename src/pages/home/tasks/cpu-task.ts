import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class CpuTask extends Task {

  constructor(count: number) {
    super(Rx.Observable.create(function(observer) {
      CpuTask.calculateSqrts().subscribe(
        function(data) { }, function(err) { }, function() { observer.complete(); }
      );
    }), count);
  }

  @offloadable
  static calculateSqrts(): any {
    let a = 0;
    for (let i = 0; i < 500000000; i++) {
      a = Math.sqrt(i);
    }
    console.log("[CPU] Calculated the result: " + a);
    return a;
  }
}

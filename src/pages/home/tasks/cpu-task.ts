import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class CpuTask extends Task {

  private static MAX_SQRT = 500000000;

  constructor(count: number, useRandomParams: boolean) {
    super(Rx.Observable.create(function(observer) {
      let maxSqrt = useRandomParams ? Math.random() * CpuTask.MAX_SQRT : CpuTask.MAX_SQRT;
      CpuTask.calculateSqrts(maxSqrt).subscribe(
        function(data) { }, function(err) { }, function() { observer.complete(); }
      );
    }), count);
  }

  @offloadable
  static calculateSqrts(maxSqrt: number): any {
    let a = 0;
    for (let i = 0; i < maxSqrt; i++) {
      a = Math.sqrt(i);
    }
    console.log("[CPU] Calculated the result: " + a);
    return a;
  }
}

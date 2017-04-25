import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class CpuTask extends Task {

  private static MIN_SQRT = 10000000;
  private static MAX_SQRT = 100000000;

  constructor(useRandomParams: boolean) {
    super(Rx.Observable.create(function(observer) {
      let maxSqrt = useRandomParams ? Math.floor(CpuTask.MIN_SQRT + (Math.random() * CpuTask.MAX_SQRT)) : CpuTask.MAX_SQRT;
      CpuTask.calculateSqrts(maxSqrt).subscribe(
        function(data) { }, function(err) { }, function() { observer.complete(); }
      );
    }));
  }

  @offloadable(false)
  static calculateSqrts(maxSqrt): any {
    var a = 0;
    for (var i = 0; i < maxSqrt; i++) {
      a = Math.sqrt(i);
    }
    return a;
  }
}

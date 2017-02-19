import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class WifiTask extends Task {

  constructor(durationSeconds: number) {
    super(Rx.Observable.create(function(observer) {
      var ld = function() {
        console.log("[WiFi] Downloaded the image");
        observer.complete();
      };
      WifiTask.download(ld);
    }), durationSeconds * 1000)
  }

  @offloadable
  static download(callback): any {
    var img = new Image();
    img.onload = callback;
    img.src = "http://www.tipsforlawyers.com/wp-content/uploads/2014/08/networking-links.jpg?" + Math.random() + '=' + new Date();
  }
}

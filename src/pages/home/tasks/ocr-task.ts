import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class OcrTask extends Task {

  constructor(durationSeconds: number) {
    super(Rx.Observable.create(function(observer) {
      var img = new Image();
      img.src = 'assets/img/sentence.jpg';
      img.onload = function() {
        var width = img.width;
        var height = img.height;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);
        let s = OcrTask.ocr(context);
        observer.next(s);
        observer.complete();
      }
    }), durationSeconds * 1000)
  }

  @offloadable
  static ocr(context2d): any {
    let s = OCRAD(context2d);
    console.log("[OCR] Result: " + s);
    return s;
  }
}

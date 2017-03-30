import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class OcrTask extends Task {

  private static IMAGES = ['assets/img/sentence.jpg', 'assets/img/sentence2.jpg'];

  constructor(count: number, useRandomParams: boolean) {
    super(Rx.Observable.create(function(observer) {
      var img = new Image();
      img.src = useRandomParams ? OcrTask.IMAGES[Math.floor(Math.random() * OcrTask.IMAGES.length)]
        : OcrTask.IMAGES[0];
      img.onload = function() {
        var width = img.width;
        var height = img.height;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);
        OcrTask.ocr(context).subscribe(
          function(data) { }, function(err) { }, function() { observer.complete(); }
        );
      }
    }), count);
  }

  @offloadable
  static ocr(context2d): any {
    let s = OCRAD(context2d);
    return s;
  }
}

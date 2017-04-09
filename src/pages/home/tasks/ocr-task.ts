import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class OcrTask extends Task {

  private static IMAGES = ['assets/img/sentence.jpg', 'assets/img/sentence2.jpg'];

  constructor(count: number, useRandomParams: boolean) {
    // HACK BEGIN
    super(null, count);
    let t = this;
    // HACK END

    this.observable = Rx.Observable.create(function(observer) {
      var img = new Image();
      img.src = useRandomParams ? OcrTask.IMAGES[Math.floor(Math.random() * OcrTask.IMAGES.length)]
        : OcrTask.IMAGES[0];
      img.onload = function() {
        var width = img.width;
        var height = img.height;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);
        var imageArr: any[] = Array.from(context.getImageData(0, 0, width, height).data);

        subject = t.ocr(imageArr, width, height);
        subject.subscribe(
          function(data) { },
          function(err) { },
          function() {
            observer.complete();
          }
        )
      }
    }).observeOn(Rx.Scheduler.async).subscribeOn(Rx.Scheduler.async);
  }

  @offloadable(true)
  ocr(imageArr, width, height): any {
    var uint8ImageData = new Uint8ClampedArray(imageArr);
    var imageData = {
      width: width,
      height: height,
      data: uint8ImageData
    }

    Tesseract.recognize(imageData)
      .then(callback);
  }
}

var subject: Rx.Subject<any>;

function callback(result) {
  console.log(result);
  subject.next(result);
  subject.complete();
}

import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class OcrTask extends Task {

  private static IMAGES = ['assets/img/ocr1.jpg', 'assets/img/ocr2.jpg',
    'assets/img/ocr3.jpg', 'assets/img/ocr4.jpg', 'assets/img/ocr5.jpg'];

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
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);
        var b64encoded = canvas.toDataURL(img.src.endsWith("jpg") ? 'image/jpeg' : 'image/png').split(',')[1];

        console.log("Image: ", img.src);

        subject = t.ocr(b64encoded, width, height);
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
  ocr(b64encoded, width, height): any {
    var byteString = atob(b64encoded);
    var imageArray = new Uint8ClampedArray(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      imageArray[i] = byteString.charCodeAt(i);
    }

    var imageData = {
      width: width,
      height: height,
      data: imageArray
    }

    Tesseract.recognize(imageData)
      .then(callback);
  }
}

var subject: Rx.Subject<any>;

function callback(result) {
  subject.next(result);
  subject.complete();
}

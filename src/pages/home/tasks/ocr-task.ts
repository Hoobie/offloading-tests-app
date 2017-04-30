import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class OcrTask extends Task {

  constructor(imgSrc: string) {
    // HACK BEGIN
    super(null);
    let t = this;
    // HACK END

    this.observable = Rx.Observable.create(function(observer) {
      var img = new Image();
      img.src = imgSrc;
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
          function(err) {
            observer.error(err);
          },
          function() {
            observer.complete();
          }
        );
      }
    }).observeOn(Rx.Scheduler.asap).subscribeOn(Rx.Scheduler.asap);
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

    Tesseract.recognize(imageData, {
      lang: 'eng',
    }).then(callback);
  }
}

var subject: Rx.Subject<any>;

function callback(result) {
  subject.next(result);
  subject.complete();
}

import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class OcrTask extends Task {

  constructor(imgSrc: string) {
    // HACK BEGIN
    super(null);
    let t = this;
    // END

    this.observable = Rx.Observable.create(function(observer) {
      var img = new Image();
      img.onload = function() {
        var width = img.width;
        var height = img.height;
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);
        var b64encoded = canvas.toDataURL(img.src.endsWith("jpg") ? 'image/jpeg' : 'image/png');

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
      img.src = imgSrc;
    }).subscribeOn(Rx.Scheduler.asap);
  }

  @offloadable(true)
  ocr(b64encoded, width, height): any {
    var img = new Image();
    img.onload = function() {
      var canvas = new Canvas(width, height);
      var context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, width, height);
      var imageData = context.getImageData(0, 0, width, height);
      var imageData2 = {
        data: imageData.data,
        width: width,
        height: height
      };

      Tesseract.recognize(imageData2, {
        lang: 'eng',
      }).then(callback);
    }
    img.src = b64encoded;
  }
}

function Canvas(width, height): void {
  let canv = document.createElement('canvas');
  canv.width = width;
  canv.height = height;
  return <any>canv;
}

var subject: Rx.Subject<any>;

function callback(result) {
  subject.next(result);
  subject.complete();
}

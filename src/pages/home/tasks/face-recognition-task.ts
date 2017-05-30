import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class FaceRecognitionTask extends Task {

  constructor(imgSrc: string, classifier: string) {
    super(Rx.Observable.create(function(observer) {
      FaceRecognitionTask.recognizeFaces(observer, imgSrc, classifier);
    }));
  }

  static recognizeFaces(observer, imgSrc, classifier) {
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

      subject = FaceRecognitionTask.findObjects(b64encoded, width, height, classifier);
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
  }

  @offloadable(true)
  static findObjects(b64encoded, width, height, classifier): any {
    var img = new Image();
    img.onload = function() {
      var results;

      var canvas = new Canvas(width, height);
      var context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, width, height);
      var imageData = context.getImageData(0, 0, width, height);

      var tracker = new tracking.ObjectTracker(classifier);
      tracker.setEdgesDensity(0.1);
      tracker.setInitialScale(1.0);
      tracker.setScaleFactor(1.25);
      tracker.setStepSize(1.5);
      var task = new tracking.TrackerTask(tracker);

      tracker.on('track', function(event) {
        results = event.data;
        task.stop();
      });

      task.on('run', function() {
        tracker.track(imageData.data, width, height);
      });
      task.run();

      const int = setInterval(function() {
        if (!task.inRunning()) {
          clearInterval(int);
          console.log("fr done");
          callback(results);
        }
      }, 10);
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

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

      subject = FaceRecognitionTask.findObjects(b64encoded, width, height, classifier);
      subject.subscribe(
        function(data) { }, function(err) { observer.error(err); }, function() { observer.complete(); }
      );
    }
  }

  @offloadable(true)
  static findObjects(b64encoded, width, height, classifier): any {
    var results;
    var byteString = atob(b64encoded);
    var imageArray = new Uint8ClampedArray(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      imageArray[i] = byteString.charCodeAt(i);
    }

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
      tracker.track(imageArray, width, height);
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
}

var subject: Rx.Subject<any>;

function callback(result) {
  subject.next(result);
  subject.complete();
}

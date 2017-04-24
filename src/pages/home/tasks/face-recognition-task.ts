import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class FaceRecognitionTask extends Task {

  private static IMAGES = ['assets/img/faces1.jpg', 'assets/img/faces2.jpg',
  'assets/img/faces3.jpg', 'assets/img/faces4.jpg', 'assets/img/faces5.jpg'];

  constructor(count: number, useRandomParams: boolean) {
    super(Rx.Observable.create(function(observer) {
      FaceRecognitionTask.recognizeFaces(observer, useRandomParams);
    }), count);
  }

  static recognizeFaces(observer, useRandomParams) {
    var img = new Image();
    img.src = useRandomParams ? FaceRecognitionTask.IMAGES[Math.floor(Math.random() * FaceRecognitionTask.IMAGES.length)]
      : FaceRecognitionTask.IMAGES[0];
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

      let trackers = ['face', 'eye', 'mouth'];
      if (useRandomParams) {
        for (let i = 0; i < 2; i++) {
          if (Math.random() > 0.5) {
            trackers.pop();
          }
        }
      }
      FaceRecognitionTask.findObjects(b64encoded, width, height, trackers).subscribe(
        function(data) { }, function(err) { }, function() { observer.complete(); }
      );
    }
  }

  @offloadable(false)
  static findObjects(b64encoded, width, height, trackers): any {
    var results = [];
    var byteString = atob(b64encoded);
    var imageArray = new Uint8ClampedArray(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      imageArray[i] = byteString.charCodeAt(i);
    }

    var tracker = new tracking.ObjectTracker(trackers);
    var task = new tracking.TrackerTask(tracker);

    tracker.on('track', function(event) {
      event.data.forEach(function(rect) {
        results.push([rect.x, rect.y, rect.width, rect.height]);
      });
      task.stop();
    });

    task.on('run', function() {
      tracker.track(imageArray, width, height);
    });
    task.run();

    while (task.inRunning()) {
      // wait
      // FIXME
    }
    return results;
  }
}

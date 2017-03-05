import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class FaceRecognitionTask extends Task {

  constructor(durationSeconds: number) {
    super(Rx.Observable.create(function(observer) {
      FaceRecognitionTask.recognizeFaces(observer);
    }), durationSeconds * 1000)
  }

  static recognizeFaces(observer) {
    var img = new Image();
    img.src = 'assets/img/faces.jpg';
    img.onload = function() {
      var width = img.width;
      var height = img.height;
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, width, height);
      var imageData: any[] = Array.from(context.getImageData(0, 0, width, height).data);

      FaceRecognitionTask.findObjects(imageData, width, height).subscribe(
        function(data) { }, function(err) { }, function() { observer.complete(); }
      );
    }
  }

  @offloadable
  static findObjects(imageData, width, height): any {
    var results: any[] = [];
    var uint8ImageData = new Uint8ClampedArray(imageData);

    var tracker = new tracking.ObjectTracker(['face', 'eye', 'mouth']);
    var task = new tracking.TrackerTask(tracker);
    tracker.setStepSize(1.7);

    tracker.on('track', function(event) {
      event.data.forEach(function(rect) {
        results.push([rect.x, rect.y, rect.width, rect.height]);
      });
      task.stop();
    });

    task.on('run', function() {
      tracker.track(uint8ImageData, width, height);
    });
    task.run();

    while (task.inRunning()) {
      // wait
      // FIXME
    }
    return results;
  }
}

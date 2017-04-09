import { Task } from "./task";
import { offloadable } from 'ml-offloading';
import * as Rx from 'rxjs';

export class FaceRecognitionTask extends Task {

  private static IMAGES = ['assets/img/faces.jpg', 'assets/img/faces2.jpg'];

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
      var context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, width, height);
      var imageData: any[] = Array.from(context.getImageData(0, 0, width, height).data);

      FaceRecognitionTask.findObjects(imageData, width, height).subscribe(
        function(data) { }, function(err) { }, function() { observer.complete(); }
      );
    }
  }

  @offloadable(false)
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

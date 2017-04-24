import * as Rx from "rxjs";
import { Task } from "./tasks/task";
import { Configuration } from "ml-offloading";
import { OcrTask } from "./tasks/ocr-task";
import { FaceRecognitionTask } from "./tasks/face-recognition-task";
import { TasksRunner } from "./tasks/tasks-runner";
import { Component } from '@angular/core';
import { NavController, Platform  } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  output = "";
  tasks = [];
  progress = 0;
  maxProgress: number = 0;
  done = false;
  repeatWithWifiTurnedOff = false;
  useRandomParameters = true;
  classifier = "KNN";
  localEndpoint = "192.168.1.108";
  remoteEndpoint = "52.57.33.230";

  constructor(public navCtrl: NavController, public plt: Platform) {
    let instance = this;

    let onBatteryStatus = function(status) {
      console.debug("Level: " + status.level + " isPlugged: " + status.isPlugged);
      instance.log("[BATTERY] Level: " + status.level);
    };
    window.addEventListener("batterystatus", onBatteryStatus, false);

    this.debug("Ready")
  }

  runAllTasks(frCount, ocrCount) {
    console.debug("Running all the tasks, CPU count: %d, FR count: %d, OCR count: %d", frCount, ocrCount);

    console.log("Local endpoint:", this.localEndpoint);
    console.log("Remote endpoint:", this.remoteEndpoint);
    Configuration.localEndpoint = this.localEndpoint;
    Configuration.remoteEndpoint = this.remoteEndpoint;

    console.log("Classifier:", this.classifier);
    switch (this.classifier) {
      case "KNN":
        Configuration.classifier = Configuration.ClassifierType.KNN;
        break;
      case "NEURAL_NETWORK":
        Configuration.classifier = Configuration.ClassifierType.NEURAL_NETWORK;
        break;
      case "DECISION_TREE":
        Configuration.classifier = Configuration.ClassifierType.DECISION_TREE;
        break;
      default:
        throw new Error("Classifier not defined");
    }

    this.done = false;
    this.tasks = [];

    this.tasks.push(new Task(Rx.Observable.create(function(observer) {
      Configuration.execution = Configuration.ExecutionType.LOCAL;
      observer.complete();
    }), 1));
    this.tasks.push(new FaceRecognitionTask(frCount, this.useRandomParameters));
    this.tasks.push(new OcrTask(ocrCount, this.useRandomParameters));

    this.tasks.push(new Task(Rx.Observable.create(function(observer) {
      Configuration.execution = Configuration.ExecutionType.PC_OFFLOADING;
      observer.complete();
    }), 1));
    this.tasks.push(new FaceRecognitionTask(frCount, this.useRandomParameters));
    this.tasks.push(new OcrTask(ocrCount, this.useRandomParameters));

    this.tasks.push(new Task(Rx.Observable.create(function(observer) {
      Configuration.execution = Configuration.ExecutionType.CLOUD_OFFLOADING;
      observer.complete();
    }), 1));
    this.tasks.push(new FaceRecognitionTask(frCount, this.useRandomParameters));
    this.tasks.push(new OcrTask(ocrCount, this.useRandomParameters));

    this.tasks.push(new Task(Rx.Observable.create(function(observer) {
      Configuration.execution = Configuration.ExecutionType.PREDICTION;
      observer.complete();
    }), 1));
    this.tasks.push(new FaceRecognitionTask(frCount, this.useRandomParameters));
    this.tasks.push(new OcrTask(ocrCount, this.useRandomParameters));

    this.maxProgress = 0;
    for (let task of this.tasks) {
      this.maxProgress += parseInt(task.count) || 0;
    }
    console.debug("Max progress:", this.maxProgress);

    this.runTasks();
  }

  runTasks() {
    this.progress = 0;
    let instance = this;
    let tasksRunner = new TasksRunner(this.tasks);

    this.debug("Running all the tasks");

    tasksRunner.runAll().subscribe(
      function(data) { instance.progress++; },
      function(err) { },
      function() { instance.handleTasksCompletion(instance) }
    );
  }

  handleTasksCompletion(instance) {
    instance.debug("All the tasks are done");

    if (!instance.done && instance.repeatWithWifiTurnedOff) {
      if (instance.plt.is('cordova')) {
        WifiWizard.setWifiEnabled(
          false,
          function() {
            instance.debug("WiFi turned off");
            instance.runTasks();
          },
          function(err) { console.error(err) }
        );
      } else {
        instance.runTasks();
      }
    }
    instance.done = true;
  }

  debug(msg: string) {
    this.log("[DEBUG] " + msg);
  }

  log(msg: string) {
    let date = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    this.output += "<li>" + date + "> " + msg + "</li>";
  }
}

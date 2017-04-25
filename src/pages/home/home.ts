import * as Rx from "rxjs";
import { Task } from "./tasks/task";
import { Configuration } from "ml-offloading";
import { OcrTask } from "./tasks/ocr-task";
import { OcrParamsProvider } from "./tasks/params-providers/ocr-params-provider";
import { FaceRecognitionTask } from "./tasks/face-recognition-task";
import { FaceRecognitionParamsProvider } from "./tasks/params-providers/face-recognition-params-provider";
import { TasksRunner } from "./tasks/tasks-runner";
import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  static PAUSE = 1500;
  output = "";
  tasks = [];
  progress = 0;
  done = false;
  localEndpoint = "192.168.1.107";
  remoteEndpoint = "52.57.33.230";
  randomTrainingRounds = 20;
  testingRounds = 30;
  repeatWithWifiTurnedOff = false;

  constructor(public navCtrl: NavController, public plt: Platform) {
    let instance = this;

    let onBatteryStatus = function(status) {
      console.debug("Level: " + status.level + " isPlugged: " + status.isPlugged);
      instance.log("[BATTERY] Level: " + status.level);
    };
    window.addEventListener("batterystatus", onBatteryStatus, false);

    this.debug("Ready")
  }

  runAllTasks() {
    this.done = false;
    this.tasks = [];

    let frParamsProvider = new FaceRecognitionParamsProvider();
    let ocrParamsProvider = new OcrParamsProvider();

    console.log("Local endpoint:", this.localEndpoint);
    console.log("Remote endpoint:", this.remoteEndpoint);
    Configuration.localEndpoint = this.localEndpoint;
    Configuration.remoteEndpoint = this.remoteEndpoint;

    /* RANDOM TRAINING ROUNDS */
    for (let i = 0; i < this.randomTrainingRounds; i++) {
      this.tasks.push(new Task(Rx.Observable.create(function(observer) {
        setTimeout(function() {
          observer.complete();
          Configuration.roundId = -1;
          Configuration.shouldTrain = true;
          Configuration.shouldTrainAllClassifiers = true;

          let rand = Math.random();
          Configuration.execution = rand > 0.33 ?
            (rand > 0.67 ? Configuration.ExecutionType.LOCAL : Configuration.ExecutionType.PC_OFFLOADING)
            : Configuration.ExecutionType.CLOUD_OFFLOADING;
        }, HomePage.PAUSE);
      })));
      if (Math.random() > 0.5) {
        this.tasks.push(new FaceRecognitionTask(frParamsProvider.getRandomImgSrc(), frParamsProvider.getRandomTracker()));
      } else {
        this.tasks.push(new OcrTask(ocrParamsProvider.getRandomImgSrc()));
      }
    }

    /* TESTING ROUNDS */
    for (let i = 0; i < this.testingRounds; i++) {
      let task = 0;
      if (Math.random() > 0.5) {
        task = 1;
      }
      let frImgSrc = frParamsProvider.getRandomImgSrc();
      let frTrackers = frParamsProvider.getRandomTracker();
      let ocrImgSrc = ocrParamsProvider.getRandomImgSrc();

      /* LOCAL */
      this.tasks.push(new Task(Rx.Observable.create(function(observer) {
        setTimeout(function() {
          Configuration.roundId = i;
          Configuration.execution = Configuration.ExecutionType.LOCAL;
          Configuration.shouldTrain = false;
          observer.complete();
        }, HomePage.PAUSE);
      })));
      if (task === 0) {
        this.tasks.push(new FaceRecognitionTask(frImgSrc, frTrackers));
      } else {
        this.tasks.push(new OcrTask(ocrImgSrc));
      }

      /* PC */
      this.tasks.push(new Task(Rx.Observable.create(function(observer) {
        setTimeout(function() {
          Configuration.execution = Configuration.ExecutionType.PC_OFFLOADING;
          observer.complete();
        }, HomePage.PAUSE);
      })));
      if (task === 0) {
        this.tasks.push(new FaceRecognitionTask(frImgSrc, frTrackers));
      } else {
        this.tasks.push(new OcrTask(ocrImgSrc));
      }

      /* CLOUD */
      this.tasks.push(new Task(Rx.Observable.create(function(observer) {
        setTimeout(function() {
          Configuration.execution = Configuration.ExecutionType.CLOUD_OFFLOADING;
          observer.complete();
        }, HomePage.PAUSE);
      })));
      if (task === 0) {
        this.tasks.push(new FaceRecognitionTask(frImgSrc, frTrackers));
      } else {
        this.tasks.push(new OcrTask(ocrImgSrc));
      }

      /* KNN */
      this.tasks.push(new Task(Rx.Observable.create(function(observer) {
        setTimeout(function() {
          Configuration.execution = Configuration.ExecutionType.PREDICTION;
          Configuration.classifier = Configuration.ClassifierType.KNN;
          Configuration.shouldTrain = true;
          Configuration.shouldTrainAllClassifiers = false;
          observer.complete();
        }, HomePage.PAUSE);
      })));
      if (task === 0) {
        this.tasks.push(new FaceRecognitionTask(frImgSrc, frTrackers));
      } else {
        this.tasks.push(new OcrTask(ocrImgSrc));
      }

      /* NEURAL NETWORK */
      this.tasks.push(new Task(Rx.Observable.create(function(observer) {
        setTimeout(function() {
          Configuration.classifier = Configuration.ClassifierType.NEURAL_NETWORK;
          observer.complete();
        }, HomePage.PAUSE);
      })));
      if (task === 0) {
        this.tasks.push(new FaceRecognitionTask(frImgSrc, frTrackers));
      } else {
        this.tasks.push(new OcrTask(ocrImgSrc));
      }

      /* DECISION TREE */
      this.tasks.push(new Task(Rx.Observable.create(function(observer) {
        setTimeout(function() {
          Configuration.classifier = Configuration.ClassifierType.DECISION_TREE;
          observer.complete();
        }, HomePage.PAUSE);
      })));
      if (task === 0) {
        this.tasks.push(new FaceRecognitionTask(frImgSrc, frTrackers));
      } else {
        this.tasks.push(new OcrTask(ocrImgSrc));
      }
    }

    console.log("Running all the tasks, random training rounds: %d, testing rounds: %d",
      this.randomTrainingRounds, this.testingRounds);
    console.debug("Progress length:", this.tasks.length);

    this.runTasks();
  }

  runTasks() {
    this.progress = 0;
    let instance = this;
    let tasksRunner = new TasksRunner(this.tasks);

    this.debug("Running all the tasks");

    tasksRunner.runAll().subscribe(
      function(data) { instance.progress++; },
      function(err) { console.error(err); },
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

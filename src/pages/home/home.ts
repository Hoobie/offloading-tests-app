import { OcrTask } from "./tasks/ocr-task";
import { FaceRecognitionTask } from "./tasks/face-recognition-task";
import { CpuTask } from "./tasks/cpu-task";
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
  maxProgress = 100;
  done = false;
  repeatWithWifiTurnedOf = false;

  constructor(public navCtrl: NavController, public plt: Platform) {
    let instance = this;

    let onBatteryStatus = function(status) {
      console.debug("Level: " + status.level + " isPlugged: " + status.isPlugged);
      instance.log("[BATTERY] Level: " + status.level);
    };
    window.addEventListener("batterystatus", onBatteryStatus, false);

    this.debug("Ready")
  }

  runAllTasks(cpuCount, frCount, ocrCount) {
    this.done = false;
    this.maxProgress = (parseInt(cpuCount) || 0) + (parseInt(frCount) || 0) + (parseInt(ocrCount) || 0);

    console.debug("Running all the tasks, CPU count: %d, FR count: %d, OCR count: %d", cpuCount, frCount, ocrCount);

    this.tasks.push(new CpuTask(cpuCount));
    this.tasks.push(new FaceRecognitionTask(frCount));
    this.tasks.push(new OcrTask(ocrCount));
    // this.tasks.push(new WifiTask(wifiDuration));

    this.runTasks();
  }

  runTasks() {
    let instance = this;
    let tasksRunner = new TasksRunner(this.tasks);
    this.progress = 0;

    this.debug("Running all the tasks");

    this.startPowerMeasurements();
    tasksRunner.runAll().subscribe(
      function(data) { instance.handleNextTask(data, instance) },
      function(err) { instance.handleTaskError(err, instance) },
      function() { instance.handleTasksCompletion(instance) }
    );
  }

  startPowerMeasurements() {
    let instance = this;
    if (this.plt.is('cordova')) {
      (window as MyWindow).startPowerMeasurements(function(msg) {
        if (msg) {
          instance.log("[POW_PROFILES] " + msg);
        }
      });
    }
  }

  handleNextTask(data, instance) {
    instance.progress += 1;
    if (instance.plt.is('cordova')) {
      (window as MyWindow).stopPowerMeasurements(function(battery) {
        instance.log("[POW_PROFILES] stats: " + JSON.stringify(battery));
      });
      instance.startPowerMeasurements();
    }
  }

  handleTaskError(err, instance) {
    if (instance.plt.is('cordova')) {
      (window as MyWindow).stopPowerMeasurements(function(battery) { });
    }
  }

  handleTasksCompletion(instance) {
    if (instance.plt.is('cordova')) {
      (window as MyWindow).stopPowerMeasurements(function(battery) { });
    }
    instance.debug("All the tasks are done");

    if (!instance.done && instance.repeatWithWifiTurnedOf) {
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
      instance.done = true;
    }
  }

  debug(msg: string) {
    this.log("[DEBUG] " + msg);
  }

  log(msg: string) {
    let date = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    this.output += "<li>" + date + "> " + msg + "</li>";
  }
}

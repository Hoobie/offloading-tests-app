import { OcrTask } from "./tasks/ocr-task";
import { FaceRecognitionTask } from "./tasks/face-recognition-task";
import { CpuTask } from "./tasks/cpu-task";
import { TasksRunner } from "./tasks/tasks-runner";
import { Component, ViewChild } from '@angular/core';
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

  constructor(public navCtrl: NavController, public plt: Platform) {
    let t = this;

    let onBatteryStatus = function(status) {
      console.debug("Level: " + status.level + " isPlugged: " + status.isPlugged);
      t.log("[BATTERY] Level: " + status.level);
    };
    window.addEventListener("batterystatus", onBatteryStatus, false);

    this.debug("Ready")
  }

  runAllTasks(cpuCount, frCount, ocrCount) {

    this.progress = 0;
    this.maxProgress = parseInt(cpuCount) || 0 + parseInt(frCount) || 0 + parseInt(ocrCount) || 0;

    console.debug("Running all the tasks, CPU count: %d, FR count: %d, OCR count: %d", cpuCount, frCount, ocrCount);

    this.plt.ready().then(() => {
      this.tasks.push(new CpuTask(cpuCount));
      this.tasks.push(new FaceRecognitionTask(frCount));
      this.tasks.push(new OcrTask(ocrCount));
      // this.tasks.push(new WifiTask(wifiDuration));

      this.debug("Running all the tasks");

      let t = this;
      let tasksRunner = new TasksRunner(this.tasks);
      if (this.plt.is('cordova')) {
        (window as MyWindow).startPowerMeasurements(function(msg) {
          if (msg) {
            t.log("[POW_PROFILES] " + msg);
          }
        });
      }
      tasksRunner.runAll().subscribe(function(data: any) {
        t.debug("The task is done");
        t.progress += data;
        if (t.plt.is('cordova')) {
          (window as MyWindow).stopPowerMeasurements(function(battery) {
            t.log("[POW_PROFILES] stats: " + JSON.stringify(battery));
          });
          (window as MyWindow).startPowerMeasurements(function(battery) {
          });
        }
      }, function(err) {
        if (t.plt.is('cordova')) {

          (window as MyWindow).stopPowerMeasurements(function(battery) {
          });
        }
      }, function() {
        if (t.plt.is('cordova')) {

          (window as MyWindow).stopPowerMeasurements(function(battery) {
          });
        }
        t.debug("All the tasks are done");
      });
    });
  }

  debug(msg: string) {
    this.log("[DEBUG] " + msg);
  }

  log(msg: string) {
    let date = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    this.output += "<li>" + date + "> " + msg + "</li>";
  }
}

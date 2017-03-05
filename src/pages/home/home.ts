import { OcrTask } from "./tasks/ocr-task";
import { FaceRecognitionTask } from "./tasks/face-recognition-task";
import { CpuTask } from "./tasks/cpu-task";
import { TasksRunner } from "./tasks/tasks-runner";
import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  output = "";
  tasks = [];

  constructor(public navCtrl: NavController, public plt: Platform) {
    let t = this;

    let onBatteryStatus = function(status) {
      console.debug("Level: " + status.level + " isPlugged: " + status.isPlugged);
      t.log("[BATTERY] Level: " + status.level);
    };
    window.addEventListener("batterystatus", onBatteryStatus, false);

    this.debug("Ready")
  }

  runAllTasks(cpuDuration: number, frDuration: number, ocrDuration: number) {
    console.debug("Running all the tasks, CPU for: %ds, FR for: %ds, OCR for %ds", cpuDuration, frDuration, ocrDuration);
    this.plt.ready().then(() => {
      this.tasks.push(new CpuTask(cpuDuration));
      this.tasks.push(new FaceRecognitionTask(frDuration));
      this.tasks.push(new OcrTask(ocrDuration));
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
      tasksRunner.runAll().subscribe(function(data) {
        t.debug("The task is done");
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

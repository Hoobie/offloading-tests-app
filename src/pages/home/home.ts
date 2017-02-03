import { TasksRunner } from "./tasks/tasks-runner";
import { Task } from "./tasks/task";
import { Component } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType, Response } from '@angular/http';
import { NavController, Platform } from 'ionic-angular';
import * as Rx from 'rxjs';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  output = "";

  constructor(public navCtrl: NavController, public plt: Platform, private http: Http) {
    this.plt.ready().then(() => {
      let tasks = [];
      let t = this;

      let cpuTask = new Task(
        Rx.Observable.create(function(observer) {
          let a = 0;
          for (let i = 0; i < 100000000; i++) {
            a = Math.sqrt(i);
          }
          t.log("[CPU] Calculated the result: " + a);
          observer.complete();
        }), 5000);
      tasks.push(cpuTask);

      let wifiTask = new Task(
        Rx.Observable.create(function(observer) {
          var ld = function() {
            t.log("[WiFi] Downloaded the image");
            observer.complete();
          };

          var img = new Image();
          img.onload = ld;
          img.src = "http://www.tipsforlawyers.com/wp-content/uploads/2014/08/networking-links.jpg?" + Math.random() + '=' + new Date();
        }), 5000);
      tasks.push(wifiTask);

      this.log("Running all the tasks");
      let tasksRunner = new TasksRunner(tasks);
      tasksRunner.runAll().subscribe(function(data) {
        t.log("[DEBUG] The task is done");
      }, function(err) { }, function() {
        t.log("[DEBUG] All the tasks are done");
      });
    });
  }

  log(msg: string) {
    this.output += "> " + msg + "<br/>";
  }
}

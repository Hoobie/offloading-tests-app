/*
  Declaration files are how the Typescript compiler knows about the type information(or shape) of an object.
  They're what make intellisense work and make Typescript know all about your code.

  A wildcard module is declared below to allow third party libraries to be used in an app even if they don't
  provide their own type declarations.

  To learn more about using third party libraries in an Ionic app, check out the docs here:
  http://ionicframework.com/docs/v2/resources/third-party-libs/

  For more info on type definition files, check out the Typescript docs here:
  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
*/
declare module '*';

interface MyWindow extends Window {
  startPowerMeasurements(fun: (data) => any): any;
  stopPowerMeasurements(fun: (data) => any): any;
}

declare namespace tracking {
  class TrackerTask {
    constructor(tracker: ObjectTracker);

    inRunning(): boolean;

    on(event: string, callback: () => void)

    run(): TrackerTask;

    stop(): TrackerTask;
  }

  class ObjectTracker {
    constructor(classifier: string);

    setEdgesDensity(density: number);
    setInitialScale(scale: number);
    setScaleFactor(factor: number);
    setStepSize(size: number);

    on(event: string, callback: (event) => void);

    track(pixels: any, width: number, height: number);
  }

  function one(element: any): any;

  function track(element: string, tracker: ObjectTracker);
}

declare namespace WifiWizard {
  function setWifiEnabled(enabled: boolean, win: () => void, fail: (err) => void);
}

declare namespace Tesseract {
  function recognize(imageData: any, options?: any): any;
}

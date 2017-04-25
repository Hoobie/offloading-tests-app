export class FaceRecognitionParamsProvider {

  private static IMAGES = ['assets/img/faces1.jpg', 'assets/img/faces2.jpg',
    'assets/img/faces3.jpg', 'assets/img/faces4.jpg', 'assets/img/faces5.jpg'];
  private static TRACKERS = ['face', 'eye', 'mouth'];

  getRandomImgSrc(): string {
    return FaceRecognitionParamsProvider.IMAGES[Math.floor(Math.random()
      * FaceRecognitionParamsProvider.IMAGES.length)]
  }

  getRandomTracker(): string {
    return FaceRecognitionParamsProvider.TRACKERS[Math.floor(Math.random()
      * FaceRecognitionParamsProvider.TRACKERS.length)]
  }
}

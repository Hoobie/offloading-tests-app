export class FaceRecognitionParamsProvider {

  private static TRAINING_IMAGES = ['assets/img/training/fr1.jpg',
    'assets/img/training/fr2.jpg', 'assets/img/training/fr3.jpg',
    'assets/img/training/fr4.jpg', 'assets/img/training/fr5.jpg'];
  private static TRACKERS = ['face'];
  private static TESTING_IMAGES = ['assets/img/testing/fr1.jpg',
    'assets/img/testing/fr2.jpg', 'assets/img/testing/fr3.jpg',
    'assets/img/testing/fr4.jpg', 'assets/img/testing/fr5.jpg',
    'assets/img/testing/fr6.jpg'];

  getRandomImgSrc(): string {
    return FaceRecognitionParamsProvider.TRAINING_IMAGES[Math.floor(Math.random()
      * FaceRecognitionParamsProvider.TRAINING_IMAGES.length)]
  }

  getRandomTracker(): string {
    return FaceRecognitionParamsProvider.TRACKERS[Math.floor(Math.random()
      * FaceRecognitionParamsProvider.TRACKERS.length)]
  }

  getTestingImages(): Array<string> {
    return FaceRecognitionParamsProvider.TESTING_IMAGES;
  }

  getTrackers(): Array<string> {
    return FaceRecognitionParamsProvider.TRACKERS;
  }
}

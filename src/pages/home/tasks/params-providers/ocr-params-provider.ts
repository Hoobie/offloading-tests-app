export class OcrParamsProvider {

  private static TRAINING_IMAGES = ['assets/img/training/ocr1.jpg',
    'assets/img/training/ocr2.jpg', 'assets/img/training/ocr3.jpg',
    'assets/img/training/ocr4.jpg', 'assets/img/training/ocr5.jpg'];

  private static TESTING_IMAGES = ['assets/img/testing/ocr1.jpg',
    'assets/img/testing/ocr2.jpg', 'assets/img/testing/ocr3.png',
    'assets/img/testing/ocr4.jpg', 'assets/img/testing/ocr5.jpg',
    'assets/img/testing/ocr6.jpg'];

  getRandomTrainingImgSrc(): string {
    return OcrParamsProvider.TRAINING_IMAGES[Math.floor(Math.random()
      * OcrParamsProvider.TRAINING_IMAGES.length)];
  }

  getTestingImages(): Array<string> {
    return OcrParamsProvider.TESTING_IMAGES;
  }
}

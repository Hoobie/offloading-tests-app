export class OcrParamsProvider {

  private static IMAGES = ['assets/img/ocr1.jpg', 'assets/img/ocr2.jpg',
    'assets/img/ocr3.jpg', 'assets/img/ocr4.jpg', 'assets/img/ocr5.jpg'];

  getRandomImgSrc(): string {
    return OcrParamsProvider.IMAGES[Math.floor(Math.random()
      * OcrParamsProvider.IMAGES.length)]
  }
}

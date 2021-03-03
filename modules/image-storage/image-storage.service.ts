export class ImageStorageService {

  public static create(): ImageStorageService {
    if (!ImageStorageService.instance) {
      ImageStorageService.instance = new ImageStorageService();
    }

    return ImageStorageService.instance;
  }

  private static instance: ImageStorageService | null = null;

  protected constructor() {
    console.log('initialized');


    setInterval(() => {
      console.log('cache load');
    }, this.getExpirationTime());
  }

  public getAll(_page: number) {

  }

  private getExpirationTime(): number {
    const rawExpirationTime = process.env.CACHE_STORAGE_EXPIRATION_TIME_MS;

    if (!rawExpirationTime) {
      throw new Error('Set expiration time');
    }

    const expirationTime = parseInt(rawExpirationTime, 10);

    if (isNaN(expirationTime)) {
      throw new Error('Expiration time must be a number');
    }

    return expirationTime;
  }

}

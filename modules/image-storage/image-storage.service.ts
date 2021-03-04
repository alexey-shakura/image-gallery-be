import EventEmitter from "events";
import { ImageExternalProviderService } from "../image-external-provider/image-external-provider.service";
import { IImageDetails, IImagesPage } from "../image-external-provider/types";
import { StorageState } from "./enums";

export class ImageStorageService {

  public static create(): ImageStorageService {
    if (!ImageStorageService.instance) {
      ImageStorageService.instance = new ImageStorageService();
    }

    return ImageStorageService.instance;
  }

  private static instance: ImageStorageService | null = null;

  private imageInfo: IImageDetails[] = [];

  private _token: string | null = null;
  private readonly externalProviderService = new ImageExternalProviderService();

  private eventEmitter: EventEmitter = new EventEmitter();
  private currentState: StorageState = StorageState.DEFAULT;

  protected constructor() {
    console.log('initialized');

    setTimeout(async () => {
      try {
        this.currentState = StorageState.LOADING;

        await this.load();

        console.log('cache loaded');
        this.currentState = StorageState.LOADED;
        this.eventEmitter.emit(this.currentState)
      } catch (error) {
        this.currentState = StorageState.ERROR;
        this.eventEmitter.emit(this.currentState);
      }
    }, this.getExpirationTime());
  }

  private async load() {
    try {
      this._token = await this.getToken();
    } catch (error) {
      throw new Error('Something went wrong');
    }

    try {
      this.imageInfo = await this.getAllImagesInfo();
      console.log(this.imageInfo[0]);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this._token = null;
        this.load();
      } else {
        throw new Error('Something went wrong');
      }
    }
  }

  public getAll(): Promise<IImageDetails[]> {
    if (this.currentState === StorageState.LOADED) {
      return Promise.resolve(this.imageInfo);
    }

    return new Promise((resolve, reject) => {
      this.eventEmitter.once(StorageState.LOADED, () => {
        resolve(this.imageInfo);
        this.eventEmitter.removeAllListeners(StorageState.ERROR);
      });

      this.eventEmitter.once(StorageState.ERROR, () => {
        reject();
        this.eventEmitter.removeAllListeners(StorageState.LOADED);
      });
    });
  }

  private async getAllImagesInfo(): Promise<IImageDetails[]> {
    const data: IImageDetails[] = [];
    let page = 1;

    while (true) {
      const pageData = await this.getImagesPage(page);

      const detailedImages = await Promise.all(
        pageData.pictures.map((simpleImage) => this.getImageDetails(simpleImage.id))
      );

      data.push(...detailedImages);

      if (page === pageData.pageCount) {
        break;
      }

      page++;
    }

    console.log('total pages ' + page );

    return data;
  }

  private getImageDetails(id: string): Promise<IImageDetails> {
    return this.externalProviderService.getImageDetails(this._token!, id);
  }

  private getImagesPage(page: number): Promise<IImagesPage> {
    return this.externalProviderService.getImagesPage(this._token!, page);
  }

  private async getToken(): Promise<string> {
    return this._token || await this.externalProviderService.getAuthToken();
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

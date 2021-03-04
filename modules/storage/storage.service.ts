import EventEmitter from "events";
import { ExternalProviderService } from "../external-provider/external-provider.service";
import { IImageDetails, IImagesPage } from "../external-provider/types";
import { StorageState } from "./enums";

export class StorageService {

  public static create(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }

    return StorageService.instance;
  }

  private static instance: StorageService | null = null;

  private imagesDetails: IImageDetails[] = [];

  private _token: string | null = null;
  private readonly externalProviderService = new ExternalProviderService();

  private stateEventEmitter: EventEmitter = new EventEmitter();
  private currentState: StorageState = StorageState.DEFAULT;

  protected constructor() {
    setTimeout(async () => {
      try {
        this.currentState = StorageState.LOADING;

        await this.load();

        this.currentState = StorageState.LOADED;
        this.stateEventEmitter.emit(this.currentState)
      } catch (error) {
        this.currentState = StorageState.ERROR;
        this.stateEventEmitter.emit(this.currentState);
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
      this.imagesDetails = await this.getAllImagesInfo();
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
      return Promise.resolve(this.imagesDetails);
    }

    return new Promise((resolve, reject) => {
      this.stateEventEmitter.once(StorageState.LOADED, () => {
        resolve(this.imagesDetails);
        this.stateEventEmitter.removeAllListeners(StorageState.ERROR);
      });

      this.stateEventEmitter.once(StorageState.ERROR, () => {
        reject();
        this.stateEventEmitter.removeAllListeners(StorageState.LOADED);
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

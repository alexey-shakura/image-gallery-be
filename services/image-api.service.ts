import axios, { AxiosResponse } from 'axios';
import { IImagesAuthBody, IImagesAuthResponse } from '../types';

export class ImageApiService {

  private readonly BASE_URL = 'http://interview.agileengine.com';

  public async getAuthToken(): Promise<string> {
    const apiKey = process.env.IMAGES_API_KEY;

    if (!apiKey) {
      throw new Error('Set images API key');
    }

    const body: IImagesAuthBody = { apiKey };

    const response = await axios.post<IImagesAuthBody, AxiosResponse<IImagesAuthResponse>>(
      `${this.BASE_URL}/auth`,
      body
    );

    return response.data.token;
  }

}

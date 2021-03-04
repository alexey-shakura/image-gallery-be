import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IAuthRequestBody, IAuthResponse, IImageDetails, IImagesPage } from './types';

export class ImageExternalProviderService {

  private axiosInstance;

  public constructor() {
    const baseUrl = process.env.IMAGE_EXTERNAL_PROVIDER_BASE_URL;

    if (!baseUrl) {
      throw new Error('Set external provider base url');
    }

    this.axiosInstance = axios.create({ baseURL: baseUrl  });
  }

  public async getAuthToken(): Promise<string> {
    const apiKey = process.env.IMAGE_EXTERNAL_PROVIDER_API_KEY;

    if (!apiKey) {
      throw new Error('Set external provider API key');
    }

    const body: IAuthRequestBody = { apiKey };

    const response = await this.axiosInstance.post<IAuthRequestBody, AxiosResponse<IAuthResponse>>(
      '/auth',
      body
    );

    return response.data.token;
  }

  public async getImagesPage(token: string, page: number): Promise<IImagesPage> {
    const config: AxiosRequestConfig = {
      responseType: 'json',
      headers: {
        ...this.getAuthHeaders(token),
      },
      params: {
        page
      },
    };

    const response = await this.axiosInstance.get('/images', config);

    return response.data;
  }

  public async getImageDetails(token: string, id: string): Promise<IImageDetails> {
    const config: AxiosRequestConfig = {
      responseType: 'json',
      headers: {
        ...this.getAuthHeaders(token),
      },
    };

    const response = await this.axiosInstance.get(`/images/${id}`, config);

    return response.data;
  }

  private getAuthHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`
    };
  }

}

import { ISimpleImage } from "./simple-image";

export interface IImagesPage {
  pictures: ISimpleImage[];
  page: number;
  pageCount: number;
  hasMore: boolean;
}

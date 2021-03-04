import { Router } from 'express';

import { ImageExternalProviderService } from '../modules/image-external-provider/image-external-provider.service';
// import { ImageStorageService } from '../modules/image-storage/image-storage.service';

const router = Router();
// const _storage = ImageStorageService.create();
const service = new ImageExternalProviderService();

router.get('/', async (req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const images = await service.getImagesPage(token as string, 27) as any;

    console.log(images);


    res.sendStatus(200);
    // res.json(images);
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {

      console.log(error.request);
    } else {
      console.log(error.name);
      console.log(error.message);


    }

    // console.log(error.response);
    res.sendStatus(500);
  }
});

router.get('/:id', async(req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const images = await service.getImageDetails(token as string, 'd9498ac8c60009730574') as any;

    res.json(images);
  } catch (error) {

  }
});

export default router;

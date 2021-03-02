import { Router } from 'express';
import { ImageApiService } from '../services/image-api.service';

const router = Router();

const imagesApiService = new ImageApiService();

router.post('/login', async (_req, res) => {
  try {
    const token = await imagesApiService.getAuthToken();
    res.json({ token });
  } catch (error) {
    res.sendStatus(500);
  }
});

export default router;

import { Router } from 'express';
import { ImageExternalProviderService } from '../modules/image-external-provider/image-external-provider.service';

const router = Router();

const imageExternalProvider = new ImageExternalProviderService();

router.post('/login', async (_req, res) => {
  try {
    const token = await imageExternalProvider.getAuthToken();
    res.json({ token });
  } catch (error) {
    res.sendStatus(500);
  }
});

export default router;

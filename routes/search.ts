import { Router } from 'express';
import { ImageStorageService } from '../modules/image-storage/image-storage.service';

const router = Router();
const storage = ImageStorageService.create();


router.get('/:searchTerm', async (_req, _res) => {
  storage.getAll(1);
});

export default router;

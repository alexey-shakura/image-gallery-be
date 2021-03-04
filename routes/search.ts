import { Router } from 'express';
import { ImageSearchEngineService } from '../modules/image-search-engine/image-search-engine.service';
import { ImageStorageService } from '../modules/image-storage/image-storage.service';

const router = Router();
const storage = ImageStorageService.create();
const searchEngine = new ImageSearchEngineService();


router.get('/:searchTerm', async (req, res) => {
  try {
    const imagesDetails = await storage.getAll();
    const matches = searchEngine.getMatches(imagesDetails, req.params.searchTerm);

    res.json(matches);
  } catch (error) {
    res.sendStatus(500);
  }
});

export default router;

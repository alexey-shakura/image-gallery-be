import { Router } from 'express';
import { SearchEngineService } from '../modules/search-engine/search-engine.service';
import { StorageService } from '../modules/storage/storage.service';

const router = Router();
const storage = StorageService.create();
const searchEngine = new SearchEngineService();


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

import { Router } from 'express';
import {
  getRecommendations,
  generateMoodPlaylist,
  naturalLanguageSearch,
} from '../controllers/recommendationController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalAuth, getRecommendations);
router.post('/mood-playlist', optionalAuth, generateMoodPlaylist);
router.post('/natural-search', optionalAuth, naturalLanguageSearch);

export default router;

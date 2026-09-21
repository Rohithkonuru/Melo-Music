import { Router } from 'express';
import {
  getFavorites,
  toggleFavorite,
  getHistory,
  recordHistory,
  toggleFollowArtist,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect all user routes
router.use(protect);

router.get('/favorites', getFavorites);
router.post('/favorites/:songId', toggleFavorite);

router.get('/history', getHistory);
router.post('/history', recordHistory);

router.post('/follow-artist/:artistId', toggleFollowArtist);

export default router;

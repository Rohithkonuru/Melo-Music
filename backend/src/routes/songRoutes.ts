import { Router } from 'express';
import {
  getSongs,
  getTrendingSongs,
  getNewReleases,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  playSong,
} from '../controllers/songController';

const router = Router();

router.route('/')
  .get(getSongs)
  .post(createSong);

router.get('/trending', getTrendingSongs);
router.get('/new-releases', getNewReleases);

router.route('/:id')
  .get(getSongById)
  .put(updateSong)
  .delete(deleteSong);

router.post('/:id/play', playSong);

export default router;

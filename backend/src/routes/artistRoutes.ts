import { Router } from 'express';
import {
  getArtists,
  getPopularArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
} from '../controllers/artistController';

const router = Router();

router.route('/')
  .get(getArtists)
  .post(createArtist);

router.get('/popular', getPopularArtists);

router.route('/:id')
  .get(getArtistById)
  .put(updateArtist)
  .delete(deleteArtist);

export default router;

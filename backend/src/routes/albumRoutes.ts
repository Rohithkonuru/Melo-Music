import { Router } from 'express';
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from '../controllers/albumController';

const router = Router();

router.route('/')
  .get(getAlbums)
  .post(createAlbum);

router.route('/:id')
  .get(getAlbumById)
  .put(updateAlbum)
  .delete(deleteAlbum);

export default router;

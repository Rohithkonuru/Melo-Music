import { Router } from 'express';
import {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistSongs,
} from '../controllers/playlistController';

const router = Router();

router.route('/')
  .get(getPlaylists)
  .post(createPlaylist);

router.route('/:id')
  .get(getPlaylistById)
  .put(updatePlaylist)
  .delete(deletePlaylist);

router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);
router.put('/:id/reorder', reorderPlaylistSongs);

export default router;

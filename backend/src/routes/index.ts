import { Router } from 'express';
import authRoutes from './authRoutes';
import songRoutes from './songRoutes';
import artistRoutes from './artistRoutes';
import albumRoutes from './albumRoutes';
import playlistRoutes from './playlistRoutes';
import userRoutes from './userRoutes';
import analyticsRoutes from './analyticsRoutes';
import adminRoutes from './adminRoutes';
import recommendationRoutes from './recommendationRoutes';
import searchRoutes from './searchRoutes';
import uploadRoutes from './uploadRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/songs', songRoutes);
router.use('/artists', artistRoutes);
router.use('/albums', albumRoutes);
router.use('/playlists', playlistRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/search', searchRoutes);
router.use('/upload', uploadRoutes);

export default router;

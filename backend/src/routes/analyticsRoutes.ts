import { Router } from 'express';
import { getUserAnalytics, getAdminAnalytics } from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/user', protect, getUserAnalytics);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

export default router;

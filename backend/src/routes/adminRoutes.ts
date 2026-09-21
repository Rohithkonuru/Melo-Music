import { Router } from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Require admin authentication for all admin routes
router.use(protect, authorize('admin'));

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;

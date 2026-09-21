import { Response, NextFunction } from 'express';
import { User, Song, Artist, Album, Playlist } from '../models';
import { sendResponse } from '../utils/apiResponse';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all users with search, role filter, pagination
// @route   GET /api/admin/users
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'All') {
      filter.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendResponse({
      res,
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role or status
// @route   PUT /api/admin/users/:id
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, name } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new NotFoundError(`User with id ${req.params.id} not found`);
    }

    // Prevent removing admin status from the primary demo admin
    if (user.email === 'admin@melomix.com' && role && role !== 'admin') {
      throw new BadRequestError('Cannot revoke admin rights from the primary administrator');
    }

    if (role) user.role = role;
    if (name) user.name = name;

    await user.save();

    return sendResponse({
      res,
      message: 'User updated successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError(`User with id ${req.params.id} not found`);
    }

    if (user.email === 'admin@melomix.com') {
      throw new BadRequestError('Cannot delete primary administrator account');
    }

    await User.findByIdAndDelete(req.params.id);

    return sendResponse({
      res,
      message: 'User deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};

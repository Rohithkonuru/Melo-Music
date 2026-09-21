import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { sendResponse } from '../utils/apiResponse';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper to generate JWT token
const signToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError('Name, email, and password are required');
    }

    if (confirmPassword && password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
    });

    const token = signToken(user._id.toString());

    return sendResponse({
      res,
      statusCode: 201,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          favoriteGenres: user.favoriteGenres,
          likedSongs: user.likedSongs,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login existing user
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken(user._id.toString());

    return sendResponse({
      res,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          favoriteGenres: user.favoriteGenres,
          likedSongs: user.likedSongs,
          followedArtists: user.followedArtists,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id)
      .populate('favoriteArtists', 'name image')
      .populate('followedArtists', 'name image followers')
      .populate({
        path: 'recentlyPlayed.song',
        select: 'title artistName coverUrl duration audioUrl genre mood',
      });

    return sendResponse({
      res,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, avatar, favoriteGenres } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;
    if (Array.isArray(favoriteGenres)) user.favoriteGenres = favoriteGenres;

    await user.save();

    return sendResponse({
      res,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

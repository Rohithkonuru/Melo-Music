import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized, no token provided');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new UnauthorizedError('The user belonging to this token no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      } catch {
        // Silently continue for optional authentication
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`User role '${req.user?.role || 'guest'}' is not authorized to access this route`)
      );
    }
    next();
  };
};

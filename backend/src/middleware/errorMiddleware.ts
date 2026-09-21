import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error in development
  if (env.NODE_ENV !== 'test') {
    console.error(`[Error Handler] ${err.name || 'Error'}: ${err.message}`);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    error.message = `Resource not found with id of ${err.value}`;
    error.statusCode = 404;
  }

  // Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error.message = `A record with that ${field} already exists`;
    error.statusCode = 409;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val: any) => val.message);
    error.message = messages.join(', ');
    error.statusCode = 400;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid authentication token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Authentication token has expired';
    error.statusCode = 401;
  }

  const responsePayload: Record<string, any> = {
    success: false,
    message: error.message || 'Server Error',
  };

  if (env.NODE_ENV === 'development' && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(responsePayload);
};

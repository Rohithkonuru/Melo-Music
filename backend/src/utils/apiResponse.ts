import { Response } from 'express';

export interface ApiResponseOptions<T = any> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
}

export const sendResponse = <T>({
  res,
  statusCode = 200,
  message = 'Operation successful',
  data,
  meta,
}: ApiResponseOptions<T>) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    meta,
  });
};

export const sendError = (
  res: Response,
  statusCode = 500,
  message = 'Internal Server Error',
  errors: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { sendResponse } from '../utils/apiResponse';
import { BadRequestError } from '../utils/errors';

const router = Router();

// @desc    Upload an audio file or cover image
// @route   POST /api/upload
router.post(
  '/',
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!files || Object.keys(files).length === 0) {
        throw new BadRequestError('No file uploaded');
      }

      const uploadedFiles: Record<string, string> = {};

      if (files['audio'] && files['audio'][0]) {
        uploadedFiles.audioUrl = `/uploads/${files['audio'][0].filename}`;
      }
      if (files['cover'] && files['cover'][0]) {
        uploadedFiles.coverUrl = `/uploads/${files['cover'][0].filename}`;
      }
      if (files['avatar'] && files['avatar'][0]) {
        uploadedFiles.avatarUrl = `/uploads/${files['avatar'][0].filename}`;
      }

      return sendResponse({
        res,
        statusCode: 201,
        message: 'File uploaded successfully',
        data: uploadedFiles,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

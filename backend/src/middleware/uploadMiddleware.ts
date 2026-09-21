import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from '../utils/errors';

const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer disk storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for audio and image assets
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac'];

  if (file.fieldname === 'audio' || file.fieldname === 'song') {
    if (allowedAudioTypes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|ogg|flac)$/i)) {
      return cb(null, true);
    }
    return cb(new BadRequestError('Only audio files (mp3, wav, ogg, flac) are allowed!'));
  }

  if (file.fieldname === 'cover' || file.fieldname === 'image' || file.fieldname === 'avatar') {
    if (allowedImageTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return cb(null, true);
    }
    return cb(new BadRequestError('Only image files (jpg, jpeg, png, webp) are allowed!'));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB maximum
  },
});

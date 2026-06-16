import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const ALLOWED_FILE_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES];

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.fieldname === 'avatar' && !ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(new AppError('Invalid image type', 400));
    return;
  }
  if (file.fieldname === 'media') {
    if (
      file.mimetype.startsWith('image/') &&
      !ALLOWED_IMAGE_TYPES.includes(file.mimetype)
    ) {
      cb(new AppError('Invalid image type', 400));
      return;
    }
    if (
      file.mimetype.startsWith('video/') &&
      !ALLOWED_VIDEO_TYPES.includes(file.mimetype)
    ) {
      cb(new AppError('Invalid video type', 400));
      return;
    }
    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
  }
  if (file.fieldname === 'voice') {
    const voiceTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    if (!voiceTypes.includes(file.mimetype)) {
      cb(new AppError('Invalid audio type', 400));
      return;
    }
  }
  cb(null, true);
};

const limits = {
  avatar: 2 * 1024 * 1024, // 2MB
  image: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  file: 20 * 1024 * 1024, // 20MB
  voice: 10 * 1024 * 1024, // 10MB
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: limits.video,
  },
});

export const uploadAvatar = upload.single('avatar');
export const uploadMedia = upload.single('media');
export const uploadVoice = upload.single('voice');

export function generateFileName(originalName: string): string {
  const ext = path.extname(originalName);
  return `${uuidv4()}${ext}`;
}

export function getFileType(mimetype: string): 'image' | 'video' | 'file' | 'voice' {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'voice';
  return 'file';
}
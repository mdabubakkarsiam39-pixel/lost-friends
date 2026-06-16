import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';
import { getFileType } from '../utils/upload';

export class UploadController {
  static async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const result = await uploadToCloudinary(req.file.buffer, 'avatars', {
        resource_type: 'image',
      });

      res.json({ url: result.url, publicId: result.publicId });
    } catch (error) {
      next(error);
    }
  }

  static async uploadMedia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      const folder = `media/${resourceType}`;

      const result = await uploadToCloudinary(req.file.buffer, folder, {
        resource_type: resourceType,
      });

      res.json({
        url: result.url,
        publicId: result.publicId,
        type: getFileType(req.file.mimetype),
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadVoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const result = await uploadToCloudinary(req.file.buffer, 'voice', {
        resource_type: 'video',
      });

      res.json({
        url: result.url,
        publicId: result.publicId,
        type: 'voice',
        fileSize: req.file.size,
      });
    } catch (error) {
      next(error);
    }
  }
}
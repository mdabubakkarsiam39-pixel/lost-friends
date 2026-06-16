import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { authenticate } from '../middleware/auth';
import { uploadAvatar, uploadMedia, uploadVoice } from '../utils/upload';

const router = Router();

router.use(authenticate);

router.post('/avatar', uploadAvatar, UploadController.uploadAvatar);
router.post('/media', uploadMedia, UploadController.uploadMedia);
router.post('/voice', uploadVoice, UploadController.uploadVoice);

export default router;
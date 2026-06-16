import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { syncUserSchema, updateProfileSchema } from '../validators/auth';

const router = Router();

router.post('/sync', validate(syncUserSchema), AuthController.syncUser);
router.get('/me', authenticate, AuthController.getMe);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);
router.delete('/delete-account', authenticate, AuthController.deleteAccount);
router.post('/push/register', authenticate, AuthController.registerPushToken);
router.post('/push/unregister', authenticate, AuthController.unregisterPushToken);

export default router;
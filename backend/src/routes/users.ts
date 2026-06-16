import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators/auth';
import { updateSettingsSchema } from '../validators/settings';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getOwnProfile);
router.get('/friends', UserController.getUserFriends);
router.get('/requests', UserController.getPendingRequests);
router.get('/search', UserController.searchUsers);
router.get('/search/all', UserController.globalSearch);
router.get('/friendship/:targetId', UserController.getFriendshipStatus);
router.get('/settings', UserController.getPrivacySettings);
router.get('/:id', UserController.getProfile);
router.put('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.put('/settings', validate(updateSettingsSchema), UserController.updateSettings);

export default router;
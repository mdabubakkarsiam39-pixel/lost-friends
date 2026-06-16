import { Router } from 'express';
import { FriendController } from '../controllers/FriendController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { friendRequestSchema, friendActionSchema } from '../validators/friend';

const router = Router();

router.use(authenticate);

router.post('/request', validate(friendRequestSchema), FriendController.sendRequest);
router.post('/accept', validate(friendActionSchema), FriendController.acceptRequest);
router.post('/reject', validate(friendActionSchema), FriendController.rejectRequest);
router.post('/block', validate(friendRequestSchema), FriendController.blockUser);
router.post('/unblock', validate(friendRequestSchema), FriendController.unblockUser);
router.delete('/:id', FriendController.removeFriend);

export default router;
import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendMessageSchema, editMessageSchema, reactionSchema, forwardMessageSchema } from '../validators/message';

const router = Router();

router.use(authenticate);

router.get('/search', MessageController.searchMessages);
router.get('/:chatId', MessageController.getMessages);
router.post('/', validate(sendMessageSchema), MessageController.sendMessage);
router.put('/:id/deliver', MessageController.markAsDelivered);
router.put('/:id/read', MessageController.markAsRead);
router.put('/chat/:chatId/read-all', MessageController.markAllAsRead);
router.put('/:id', validate(editMessageSchema), MessageController.editMessage);
router.put('/:id/reaction', validate(reactionSchema), MessageController.addReaction);
router.delete('/:id/reaction', validate(reactionSchema), MessageController.removeReaction);
router.put('/:id/pin', MessageController.pinMessage);
router.delete('/:id/pin', MessageController.unpinMessage);
router.get('/chat/:chatId/pinned', MessageController.getPinnedMessages);
router.post('/:id/forward', validate(forwardMessageSchema), MessageController.forwardMessage);
router.delete('/:id', MessageController.deleteMessage);

export default router;
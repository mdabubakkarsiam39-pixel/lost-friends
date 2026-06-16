import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createChatSchema, createGroupSchema, joinByInviteSchema, addMemberSchema } from '../validators/chat';

const router = Router();

router.use(authenticate);

router.get('/', ChatController.getChats);
router.get('/search', ChatController.searchChats);
router.get('/archived', ChatController.getArchivedChats);
router.post('/', validate(createChatSchema), ChatController.createPrivateChat);
router.post('/group', validate(createGroupSchema), ChatController.createGroupChat);
router.post('/join', validate(joinByInviteSchema), ChatController.joinByInviteLink);
router.post('/:id/members', validate(addMemberSchema), ChatController.addMember);
router.delete('/:id/members/:memberId', ChatController.removeMember);
router.put('/:id/archive', ChatController.archiveChat);
router.delete('/:id/archive', ChatController.unarchiveChat);
router.put('/:id/mute', ChatController.muteChat);
router.delete('/:id/mute', ChatController.unmuteChat);
router.put('/:id/pin', ChatController.pinChat);
router.delete('/:id/pin', ChatController.unpinChat);
router.post('/:id/invite', ChatController.generateInviteLink);
router.post('/:id/invite/revoke', ChatController.revokeInviteLink);
router.get('/:id', ChatController.getChatById);
router.delete('/:id', ChatController.deleteChat);

export default router;
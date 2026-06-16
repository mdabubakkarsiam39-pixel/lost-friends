import { Router } from 'express';
import express from 'express';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();

router.post('/clerk', express.raw({ type: 'application/json' }), WebhookController.clerkWebhook);

export default router;
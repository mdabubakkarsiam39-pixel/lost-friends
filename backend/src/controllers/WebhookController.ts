import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { config } from '../config';
import { User } from '../models/User';

export class WebhookController {
  static async clerkWebhook(req: Request, res: Response) {
    const webhook = new Webhook(config.clerk.webhookSecret);

    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: 'Missing webhook headers' });
    }

    let event: any;
    try {
      event = webhook.verify(
        JSON.stringify(req.body),
        {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        }
      );
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const eventType = event.type;
    const data = event.data;

    switch (eventType) {
      case 'user.created':
        await User.create({
          clerkId: data.id,
          username: data.username || data.email_addresses?.[0]?.email_address?.split('@')[0] || `user_${data.id.slice(-8)}`,
          email: data.email_addresses?.[0]?.email_address || '',
          fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || 'User',
          avatar: data.image_url || '',
        });
        break;

      case 'user.updated':
        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            email: data.email_addresses?.[0]?.email_address,
            fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || undefined,
            avatar: data.image_url || undefined,
          }
        );
        break;

      case 'user.deleted':
        await User.findOneAndDelete({ clerkId: data.id });
        break;
    }

    res.status(200).json({ received: true });
  }
}
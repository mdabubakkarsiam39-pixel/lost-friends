import webpush from 'web-push';
import { NotificationService } from './NotificationService';
import { PushToken } from '../models/PushToken';
import { NotificationType } from '../types';
import { config } from '../config';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

if (config.push.vapidPublicKey && config.push.vapidPrivateKey) {
  webpush.setVapidDetails(
    config.push.vapidEmail,
    config.push.vapidPublicKey,
    config.push.vapidPrivateKey
  );
}

async function sendPushToToken(token: string, platform: string, payload: PushPayload) {
  try {
    if (platform === 'web') {
      const subscription = JSON.parse(token);
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          data: payload.data,
          icon: '/logo.png',
          badge: '/badge.png',
        })
      );
    } else if (platform === 'ios' || platform === 'android') {
      const message = {
        to: token,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error('Expo push failed:', await response.text());
      }
    }
  } catch (error) {
    console.error('Push notification error:', error);
  }
}

export class PushNotificationService {
  static async send(userId: string, type: NotificationType, payload: PushPayload) {
    await NotificationService.create({
      userId,
      type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });

    if (config.nodeEnv !== 'production') return;

    const tokens = await PushToken.find({ userId });
    const pushPromises = tokens.map((t) =>
      sendPushToToken(t.token, t.platform, payload)
    );
    await Promise.allSettled(pushPromises);
  }

  static async notifyNewMessage(userId: string, senderName: string, chatId: string, content: string) {
    return PushNotificationService.send(userId, 'new_message', {
      title: senderName,
      body: content,
      data: { chatId, type: 'new_message' },
    });
  }

  static async notifyFriendRequest(userId: string, senderName: string) {
    return PushNotificationService.send(userId, 'friend_request', {
      title: 'Friend Request',
      body: `${senderName} sent you a friend request`,
      data: { type: 'friend_request' },
    });
  }

  static async notifyFriendAccepted(userId: string, accepterName: string) {
    return PushNotificationService.send(userId, 'friend_accepted', {
      title: 'Friend Request Accepted',
      body: `${accepterName} accepted your friend request`,
      data: { type: 'friend_accepted' },
    });
  }

  static async notifyGroupInvite(userId: string, inviterName: string, groupName: string, chatId: string) {
    return PushNotificationService.send(userId, 'group_invite', {
      title: 'Group Invite',
      body: `${inviterName} invited you to ${groupName}`,
      data: { chatId, type: 'group_invite' },
    });
  }

  static async notifyMention(userId: string, senderName: string, chatId: string) {
    return PushNotificationService.send(userId, 'mention', {
      title: 'Mentioned',
      body: `${senderName} mentioned you in a message`,
      data: { chatId, type: 'mention' },
    });
  }

  static async registerToken(userId: string, token: string, platform: 'ios' | 'android' | 'web') {
    return PushToken.findOneAndUpdate(
      { token },
      { userId, token, platform },
      { upsert: true, new: true }
    );
  }

  static async unregisterToken(token: string) {
    return PushToken.findOneAndDelete({ token });
  }
}
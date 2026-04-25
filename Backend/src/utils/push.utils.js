import webpush from 'web-push';
import dotenv from 'dotenv';
dotenv.config();

// Configure VAPID
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.WEB_PUSH_EMAIL || 'mailto:support@xmentor.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('[WebPush] Tactical Uplink Configured.');
} else {
  console.warn('[WebPush] WARNING: VAPID keys missing in .env. Mobile push notifications will not work.');
}

export const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error) {
    console.error('[WebPush] Error sending notification:', error.message);
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription has expired or is no longer valid
      return { success: false, expired: true };
    }
    return { success: false, expired: false };
  }
};

/**
 * Broadcast to all subscriptions of a user
 */
export const notifyUser = async (user, payload) => {
  if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) return;

  const results = await Promise.all(
    user.pushSubscriptions.map(sub => sendPushNotification(sub, payload))
  );

  // Optional: Clean up expired subscriptions
  const expiredEndpoints = results
    .map((res, idx) => res.expired ? user.pushSubscriptions[idx].endpoint : null)
    .filter(Boolean);

  if (expiredEndpoints.length > 0) {
    user.pushSubscriptions = user.pushSubscriptions.filter(
      sub => !expiredEndpoints.includes(sub.endpoint)
    );
    await user.save();
  }
};

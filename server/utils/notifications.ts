import webpush from 'web-push'
import type { SupabaseClient } from '@supabase/supabase-js'

interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, any>
}

interface SendResult {
  sent: number
  failed: number
  details: Array<{ id: string; success: boolean; error?: string }>
}

/**
 * Send push notification to a user's devices
 */
export async function sendPushNotification(
  client: SupabaseClient,
  userId: string,
  payload: NotificationPayload
): Promise<SendResult> {
  const config = useRuntimeConfig()

  // Validate VAPID configuration
  if (!config.public.vapidPublicKey || !config.vapidPrivateKey || !config.vapidSubject) {
    console.warn('VAPID keys not configured, skipping push notification')
    return { sent: 0, failed: 0, details: [] }
  }

  // Set VAPID details
  webpush.setVapidDetails(
    config.vapidSubject,
    config.public.vapidPublicKey,
    config.vapidPrivateKey
  )

  // Get all active subscriptions for the user
  const { data: subscriptions, error: fetchError } = await client
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (fetchError || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0, details: [] }
  }

  const payloadString = JSON.stringify(payload)

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }

      try {
        await webpush.sendNotification(pushSubscription, payloadString)
        return { id: sub.id, success: true }
      } catch (err: any) {
        // Handle expired/invalid subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await client
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', sub.id)
        }
        return { id: sub.id, success: false, error: err.message }
      }
    })
  )

  const details = results.map((r) =>
    r.status === 'fulfilled' ? r.value : { id: '', success: false, error: String(r.reason) }
  )

  return {
    sent: details.filter((d) => d.success).length,
    failed: details.filter((d) => !d.success).length,
    details,
  }
}

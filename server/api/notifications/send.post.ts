import webpush from 'web-push'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Validate VAPID configuration
  if (!config.vapidPublicKey || !config.vapidPrivateKey || !config.vapidSubject) {
    throw createError({
      statusCode: 500,
      statusMessage: 'VAPID keys not configured',
    })
  }

  // Set VAPID details
  webpush.setVapidDetails(
    config.vapidSubject,
    config.public.vapidPublicKey,
    config.vapidPrivateKey
  )

  const { userId, title, body: notificationBody, data } = body

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing userId',
    })
  }

  // Get service role client to bypass RLS
  const client = await serverSupabaseServiceRole(event)

  // Get all active subscriptions for the user
  const { data: subscriptions, error: fetchError } = await client
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (fetchError) {
    throw createError({
      statusCode: 500,
      statusMessage: fetchError.message,
    })
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, message: 'No active subscriptions found' }
  }

  const payload = JSON.stringify({
    title: title || 'Medication Reminder',
    body: notificationBody || 'Time to take your medication',
    data: data || {},
  })

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
        await webpush.sendNotification(pushSubscription, payload)
        return { id: sub.id, success: true }
      } catch (err: any) {
        // Handle expired/invalid subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription no longer valid, mark as inactive
          await client
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', sub.id)
        }
        return { id: sub.id, success: false, error: err.message }
      }
    })
  )

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success
  ).length

  const failed = results.filter(
    (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
  )

  return {
    sent,
    failed: failed.length,
    details: results.map((r) =>
      r.status === 'fulfilled' ? r.value : { success: false, error: r.reason }
    ),
  }
})

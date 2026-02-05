export const useNotifications = () => {
  const config = useRuntimeConfig()
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const isSupported = useState('notifications-supported', () => false)
  const permission = useState<NotificationPermission | null>('notifications-permission', () => null)
  const isSubscribed = useState('notifications-subscribed', () => false)
  const loading = useState('notifications-loading', () => false)
  const error = useState<string | null>('notifications-error', () => null)

  const checkSupport = () => {
    if (import.meta.client) {
      isSupported.value = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
      permission.value = isSupported.value ? Notification.permission : null
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      error.value = 'Notifications not supported'
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      return result === 'granted'
    } catch (e) {
      error.value = 'Failed to request notification permission'
      return false
    }
  }

  /**
   * Convert a base64 string to Uint8Array for applicationServerKey
   */
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  /**
   * Subscribe to Web Push notifications
   */
  const subscribe = async (): Promise<boolean> => {
    if (!import.meta.client || !isSupported.value || permission.value !== 'granted') {
      return false
    }

    if (!user.value) {
      error.value = 'Must be logged in to subscribe'
      return false
    }

    loading.value = true
    error.value = null

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription()

      // If no subscription, create one
      if (!subscription) {
        const vapidPublicKey = config.public.vapidPublicKey
        if (!vapidPublicKey) {
          error.value = 'VAPID public key not configured'
          return false
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })
      }

      // Extract subscription data
      const subscriptionJson = subscription.toJSON()
      const { endpoint, keys } = subscriptionJson

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        error.value = 'Invalid subscription data'
        return false
      }

      // Save to Supabase
      const { error: upsertError } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: user.value.id,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
            is_active: true,
            device_info: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
            },
          },
          {
            onConflict: 'endpoint',
          }
        )

      if (upsertError) {
        console.error('Error saving subscription:', upsertError)
        error.value = 'Failed to save subscription'
        return false
      }

      isSubscribed.value = true
      return true
    } catch (e) {
      console.error('Subscription error:', e)
      error.value = 'Failed to subscribe to notifications'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if user is already subscribed
   */
  const checkSubscription = async (): Promise<boolean> => {
    if (!import.meta.client || !isSupported.value || !user.value) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Verify subscription exists in database
        const { data } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', user.value.id)
          .eq('is_active', true)
          .single()

        isSubscribed.value = !!data
        return !!data
      }

      isSubscribed.value = false
      return false
    } catch (e) {
      console.error('Error checking subscription:', e)
      return false
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = async (): Promise<boolean> => {
    if (!import.meta.client || !user.value) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Remove from database first
        const { error: deleteError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', user.value.id)

        if (deleteError) {
          console.error('Error removing subscription from database:', deleteError)
        }

        // Unsubscribe from push manager
        await subscription.unsubscribe()
      }

      isSubscribed.value = false
      return true
    } catch (e) {
      console.error('Error unsubscribing:', e)
      error.value = 'Failed to unsubscribe'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    checkSupport,
    requestPermission,
    subscribe,
    checkSubscription,
    unsubscribe,
  }
}

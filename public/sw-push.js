// Web Push notification handler
// This file handles push events for the Child Health Journal PWA

self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)

  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = { title: 'Notification', body: event.data.text() }
    }
  }

  const title = data.title || 'Medication Reminder'
  const options = {
    body: data.body || 'Time to take your medication',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.data?.logId || 'medication-reminder',
    data: data.data || {},
    actions: [
      {
        action: 'mark-taken',
        title: 'Mark as Taken',
      },
      {
        action: 'snooze',
        title: 'Snooze 10min',
      },
    ],
    vibrate: [200, 100, 200],
    requireInteraction: true,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)

  const notification = event.notification
  const action = event.action
  const data = notification.data

  notification.close()

  if (action === 'mark-taken' && data?.logId) {
    // Mark intake as taken via API
    event.waitUntil(
      fetch(`/api/intake-logs/${data.logId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'taken', actual_time: new Date().toISOString() }),
      })
        .then(() => {
          // Try to focus existing window or open new one
          return clients.matchAll({ type: 'window', includeUncontrolled: true })
        })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.postMessage({ type: 'INTAKE_UPDATED', logId: data.logId, status: 'taken' })
              return client.focus()
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/')
          }
        })
        .catch((err) => {
          console.error('[SW] Error marking as taken:', err)
          // Still open the app on error
          return clients.openWindow(`/?action=mark-taken&logId=${data.logId}`)
        })
    )
  } else if (action === 'snooze' && data?.logId) {
    // Notify app to schedule snooze
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: 'SNOOZE_REQUESTED',
              logId: data.logId,
              minutes: 10,
            })
            return client.focus()
          }
        }
        // If no window open, open app with snooze action
        if (clients.openWindow) {
          return clients.openWindow(`/?action=snooze&logId=${data.logId}&minutes=10`)
        }
      })
    )
  } else {
    // Default: open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
    )
  }
})

// Handle notification close (for analytics if needed)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag)
})

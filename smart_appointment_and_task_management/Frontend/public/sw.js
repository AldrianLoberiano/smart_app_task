// Service Worker for Push Notifications
// Handles background push notifications and notification actions

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  let notificationData = {
    title: 'Smart Management Reminder',
    body: 'You have a new reminder!',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'reminder',
    requireInteraction: false,
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        data: data
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    }
  );

  event.waitUntil(promiseChain);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action, event.notification.tag);
  
  event.notification.close();

  if (event.action === 'view') {
    // Open the app or focus existing window
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it
          for (let client of clientList) {
            if (client.url.includes('/') && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise open a new window
          if (clients.openWindow) {
            const urlToOpen = event.notification.data?.url || '/';
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
  // 'dismiss' action just closes the notification (already done above)
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Background sync for offline support (optional)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'sync-reminders') {
    event.waitUntil(syncReminders());
  }
});

async function syncReminders() {
  // Placeholder for syncing reminders when back online
  console.log('Syncing reminders...');
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkReminders());
  }
});

async function checkReminders() {
  // Placeholder for checking reminders periodically
  console.log('Checking reminders...');
}

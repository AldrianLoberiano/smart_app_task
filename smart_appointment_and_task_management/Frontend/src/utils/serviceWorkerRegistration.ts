// Service Worker Registration Utility
// Handles registration, updates, and subscription management

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export async function register(config?: ServiceWorkerConfig): Promise<ServiceWorkerRegistration | undefined> {
  if ('serviceWorker' in navigator) {
    // Wait for the page to load
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve);
      });
    }

    const swUrl = '/sw.js';

    if (isLocalhost) {
      // Check if service worker exists in localhost
      return checkValidServiceWorker(swUrl, config);
    } else {
      // Register service worker in production
      return registerValidSW(swUrl, config);
    }
  }

  return undefined;
}

async function registerValidSW(swUrl: string, config?: ServiceWorkerConfig): Promise<ServiceWorkerRegistration> {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker == null) {
        return;
      }

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content is available; please refresh
            console.log('New content is available; please refresh.');
            
            if (config?.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            // Content is cached for offline use
            console.log('Content is cached for offline use.');
            
            if (config?.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      };
    };

    return registration;
  } catch (error) {
    console.error('Error during service worker registration:', error);
    if (config?.onError) {
      config.onError(error as Error);
    }
    throw error;
  }
}

async function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig): Promise<ServiceWorkerRegistration | undefined> {
  try {
    // Check if the service worker can be found
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    });

    const contentType = response.headers.get('content-type');
    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf('javascript') === -1)
    ) {
      // No service worker found
      console.log('No service worker found. Probably a different app. Reload the page.');
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      window.location.reload();
      return undefined;
    } else {
      // Service worker found. Proceed as normal.
      return registerValidSW(swUrl, config);
    }
  } catch (error) {
    console.log('No internet connection found. App is running in offline mode.');
    return undefined;
  }
}

export async function unregister(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('Service worker unregistered');
    } catch (error) {
      console.error('Error unregistering service worker:', error);
    }
  }
}

export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Subscribe to push notifications
    // You'll need to generate VAPID keys for production
    // Use: npx web-push generate-vapid-keys
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // Replace with your public VAPID key
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrpcPBblQaw4MwY-dGsXVd-p4wGwMIjWmpXq7c-LQI_Q0yDYZWw'
      )
    });

    console.log('Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

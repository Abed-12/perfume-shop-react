import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let messaging;

const getMessagingInstance = async () => {
    if (messaging) return messaging;

    const supported = await isSupported();
    if (!supported) return null;

    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return messaging;
};

let cachedToken = null;

export const getFcmToken = async () => {
    if (cachedToken) return cachedToken;

    const msg = await getMessagingInstance();
    if (!msg) return null;

    try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;

        const token = await getToken(msg, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        cachedToken = token;
        return token;
    } catch (err) {
        console.error('FCM getToken failed:', err);
        return null;
    }
};

export const listenForegroundNotifications = async (callback) => {
    const msg = await getMessagingInstance();
    if (!msg) return () => {};
    return onMessage(msg, callback);
};

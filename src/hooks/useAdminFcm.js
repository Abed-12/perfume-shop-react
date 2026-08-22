import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../redux/slices/authSlice';
import { listenForegroundNotifications } from '../config/firebase';

const useAdminFcm = (onNotification) => {
    const isAdmin = useSelector(selectIsAdmin);
    const callbackRef = useRef(onNotification);

    useEffect(() => {
        callbackRef.current = onNotification;
    });

    const startListening = useCallback(async () => {
        const unsubscribe = await listenForegroundNotifications((payload) => {
            callbackRef.current?.({
                id: Date.now(),
                subject: payload.notification?.title || '',
                body: payload.notification?.body || '',
                data: payload.data || {},
                seen: false,
                receivedAt: new Date().toISOString(),
            });
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!isAdmin || Notification.permission !== 'granted') return;
        let unsub;
        startListening().then((fn) => { unsub = fn; });
        return () => { if (unsub) unsub(); };
    }, [isAdmin, startListening]);
};

export default useAdminFcm;

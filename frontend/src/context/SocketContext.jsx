import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SocketContext } from './SocketContextValue';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const socketUrl = useMemo(() => {
    const configuredUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE;
    if (configuredUrl) {
      if (/^https?:\/\//i.test(configuredUrl)) {
        return configuredUrl.replace(/\/api\/v1\/?$/i, '').replace(/\/api\/?$/i, '');
      }
    }

    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://emergencybloodconnectorbackend.vercel.app';
    }

    return null;
  }, []);

  const socket = useMemo(() => {
    if (!user) return null;

    const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (!socketUrl || !isLocalhost) return null;

    const s = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    s.on('new_notification', (payload) => {
      setNotifications((prev) => [payload.notification, ...prev].slice(0, 20));
    });

    return s;
  }, [user, socketUrl]);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  const clearLiveNotifications = useCallback(() => setNotifications([]), []);

  const socketValue = useMemo(
    () => ({ socket, liveNotifications: notifications, clearLiveNotifications }),
    [socket, notifications, clearLiveNotifications]
  );

  return (
    <SocketContext.Provider value={socketValue}>
      {children}
    </SocketContext.Provider>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
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

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return undefined;
    }

    if (!socketUrl) {
      setSocket(null);
      return undefined;
    }

    const s = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    s.on('new_notification', (payload) => {
      setNotifications((prev) => [payload.notification, ...prev].slice(0, 20));
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

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

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

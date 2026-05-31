import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Alert, Badge, Button, Card, EmptyState, PageHeader } from '../components/ui';

export default function Notifications() {
  const { clearLiveNotifications } = useSocket();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get('/notifications?limit=50');
    setItems(res.data.notifications);
    setUnreadCount(res.data.unreadCount);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message)).finally(() => setLoading(false));
    clearLiveNotifications();
  }, [clearLiveNotifications]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        action={
          unreadCount > 0 && (
            <Button variant="secondary" onClick={markAllRead}>
              Mark all read ({unreadCount})
            </Button>
          )
        }
      />
      {error && <Alert>{error}</Alert>}
      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState>No notifications yet.</EmptyState>
        ) : (
          items.map((n) => (
            <Card
              key={n._id}
              className={!n.isRead ? 'border-l-4 border-l-red-500' : ''}
            >
              <div className="flex items-center justify-between gap-2">
                <strong className="text-white">{n.title}</strong>
                <Badge>{n.type}</Badge>
              </div>
              <p className="mt-2 text-slate-300">{n.message}</p>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <time>{new Date(n.createdAt).toLocaleString()}</time>
                {!n.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n._id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

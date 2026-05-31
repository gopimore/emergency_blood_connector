import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Alert, Badge, Button, PageHeader } from '../../components/ui';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const load = () => api.get('/admin/users?limit=50').then((res) => setUsers(res.data.users));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const runAction = async (id, action) => {
    setActionId(id);
    setError('');
    try {
      if (action === 'ban') await api.patch(`/admin/users/${id}/ban`);
      if (action === 'unban') await api.patch(`/admin/users/${id}/unban`);
      if (action === 'delete') {
        if (!window.confirm('Delete this user permanently?')) return;
        await api.delete(`/admin/users/${id}`);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <PageHeader title="User management" />
      {error && <Alert>{error}</Alert>}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((u) => (
              <tr key={u._id} className="bg-slate-900">
                <td className="px-4 py-3 text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-300">{u.email}</td>
                <td className="px-4 py-3"><Badge>{u.role}</Badge></td>
                <td className="px-4 py-3">
                  <Badge variant={u.isBanned ? 'danger' : 'success'}>{u.isBanned ? 'Banned' : 'Active'}</Badge>
                </td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <div className="flex flex-wrap gap-2">
                      {!u.isBanned ? (
                        <Button variant="ghost" size="sm" disabled={actionId === u._id} onClick={() => runAction(u._id, 'ban')}>Ban</Button>
                      ) : (
                        <Button variant="secondary" size="sm" disabled={actionId === u._id} onClick={() => runAction(u._id, 'unban')}>Unban</Button>
                      )}
                      <Button variant="danger" size="sm" disabled={actionId === u._id} onClick={() => runAction(u._id, 'delete')}>Delete</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PageHeader } from '../../components/ui';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const items = [
    { label: 'Users', value: stats?.users },
    { label: 'Donors', value: stats?.donors },
    { label: 'Hospitals', value: stats?.hospitals },
    { label: 'Open requests', value: stats?.openRequests },
    { label: 'Fulfilled', value: stats?.fulfilledRequests },
    { label: 'Notifications', value: stats?.notifications },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and user management." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-xs uppercase text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>
      <Link to="/admin/users" className="block rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-red-500/50">
        <h3 className="font-semibold text-white">Manage users</h3>
        <p className="mt-1 text-sm text-slate-400">Ban, unban, or remove accounts</p>
      </Link>
    </div>
  );
}

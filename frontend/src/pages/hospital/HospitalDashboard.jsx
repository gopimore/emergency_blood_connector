import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PageHeader } from '../../components/ui';

export default function HospitalDashboard() {
  const [profile, setProfile] = useState(null);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/hospitals/profile'),
      api.get('/hospitals/requests?status=open&limit=5'),
    ]).then(([profileRes, requestsRes]) => {
      setProfile(profileRes.data.profile);
      setOpenCount(requestsRes.data.requests?.length || 0);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <PageHeader title="Hospital Dashboard" subtitle="Manage urgent blood requests and connect with donors." />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-xs uppercase text-slate-500">Hospital</p>
          <p className="mt-1 font-semibold text-white">{profile?.hospitalName}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-xs uppercase text-slate-500">Open requests</p>
          <p className="mt-1 text-2xl font-bold text-white">{openCount}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-xs uppercase text-slate-500">Contact</p>
          <p className="mt-1 text-white">{profile?.contactPhone}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/hospital/create" className="rounded-xl border border-red-500/50 bg-red-500/10 p-5 transition hover:bg-red-500/20">
          <h3 className="font-semibold text-white">Create blood request</h3>
          <p className="mt-1 text-sm text-slate-400">Alert nearby donors instantly</p>
        </Link>
        <Link to="/hospital/requests" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-slate-600">
          <h3 className="font-semibold text-white">Manage requests</h3>
          <p className="mt-1 text-sm text-slate-400">Update status & track responses</p>
        </Link>
        <Link to="/hospital/donors" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-slate-600">
          <h3 className="font-semibold text-white">Find donors</h3>
          <p className="mt-1 text-sm text-slate-400">Search by blood group nearby</p>
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PageHeader } from '../../components/ui';

function StatCard({ label, value, className }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${className || 'text-white'}`}>{value}</p>
    </div>
  );
}

export default function DonorDashboard() {
  const [profile, setProfile] = useState(null);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const profileRes = await api.get('/donors/profile');
      setProfile(profileRes.data.profile);
      const coords = profileRes.data.profile?.location?.coordinates;
      if (coords?.length === 2) {
        const [lng, lat] = coords;
        const nearbyRes = await api.get(`/blood-requests/nearby?longitude=${lng}&latitude=${lat}&limit=5`);
        setNearbyCount(nearbyRes.data.requests?.length || 0);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <PageHeader title="Donor Dashboard" subtitle="Help save lives when hospitals need blood urgently." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Blood group" value={profile?.bloodGroup} />
        <StatCard label="Availability" value={profile?.isAvailable ? 'Available' : 'Unavailable'} className={profile?.isAvailable ? 'text-green-400' : 'text-slate-400'} />
        <StatCard label="Eligibility" value={profile?.isEligible ? 'Eligible' : 'Cooling off'} className={profile?.isEligible ? 'text-green-400' : 'text-amber-400'} />
        <StatCard label="Donations" value={profile?.donationCount ?? 0} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: '/donor/requests', title: 'Nearby requests', desc: `${nearbyCount} open near you` },
          { to: '/donor/profile', title: 'Update profile', desc: 'Location & availability' },
          { to: '/donor/history', title: 'Donation history', desc: 'Past fulfilled requests' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition hover:border-red-500/50 hover:bg-slate-800">
            <h3 className="font-semibold text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

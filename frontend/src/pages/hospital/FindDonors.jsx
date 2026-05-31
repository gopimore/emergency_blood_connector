import { useState } from 'react';
import { api } from '../../api/client';
import { BLOOD_GROUPS } from '../../constants';
import { Alert, Badge, Button, Card, EmptyState, Input, Label, PageHeader, Select } from '../../components/ui';

export default function FindDonors() {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [donors, setDonors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        bloodGroup,
        longitude,
        latitude,
        radius: '20000',
      });
      const res = await api.get(`/donors/nearby?${params.toString()}`);
      setDonors(res.data.donors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Find nearby donors" />
      <form onSubmit={search} className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4">
        <Label className="min-w-100px">Blood group<Select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>{BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}</Select></Label>
        <Label className="min-w-120px">Longitude<Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required /></Label>
        <Label className="min-w-120px">Latitude<Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required /></Label>
        <Button type="button" variant="ghost" onClick={() => navigator.geolocation?.getCurrentPosition((p) => { setLongitude(p.coords.longitude); setLatitude(p.coords.latitude); })}>Use location</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Searching…' : 'Search'}</Button>
      </form>
      {error && <Alert>{error}</Alert>}
      <div className="space-y-4">
        {donors.length === 0 ? <EmptyState>Search to see available donors.</EmptyState> : donors.map((d) => (
          <Card key={d._id}>
            <div className="mb-2 flex gap-2">
              <span className="text-lg font-bold text-red-400">{d.bloodGroup}</span>
              <Badge variant={d.isAvailable ? 'success' : 'default'}>{d.isAvailable ? 'Available' : 'Unavailable'}</Badge>
              <Badge variant={d.isEligible ? 'success' : 'default'}>{d.isEligible ? 'Eligible' : 'Not eligible'}</Badge>
            </div>
            <p className="font-medium text-white">{d.user?.name || 'Donor'}</p>
            <p className="text-sm text-slate-400">{d.user?.email}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

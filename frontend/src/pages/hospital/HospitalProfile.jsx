import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Alert, Button, Input, Label, PageHeader } from '../../components/ui';

export default function HospitalProfile() {
  const [form, setForm] = useState({
    hospitalName: '', registrationNo: '', contactPhone: '',
    longitude: '', latitude: '', city: '', state: '', pincode: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/hospitals/profile').then((res) => {
      const p = res.data.profile;
      const [lng, lat] = p.location?.coordinates || ['', ''];
      setForm({
        hospitalName: p.hospitalName || '', registrationNo: p.registrationNo || '',
        contactPhone: p.contactPhone || '', longitude: lng, latitude: lat,
        city: p.address?.city || '', state: p.address?.state || '', pincode: p.address?.pincode || '',
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setForm((f) => ({ ...f, longitude: pos.coords.longitude, latitude: pos.coords.latitude }));
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = {
        hospitalName: form.hospitalName, registrationNo: form.registrationNo,
        contactPhone: form.contactPhone,
        address: { city: form.city, state: form.state, pincode: form.pincode },
      };
      if (form.longitude && form.latitude) {
        body.location = { coordinates: [Number(form.longitude), Number(form.latitude)] };
      }
      await api.patch('/hospitals/profile', body);
      setMessage('Profile saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <PageHeader title="Hospital profile" />
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert>{error}</Alert>}
      <form onSubmit={handleSave} className="max-w-lg space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6">
        <Label>Hospital name<Input value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} required /></Label>
        <Label>Registration number<Input value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} required /></Label>
        <Label>Contact phone<Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} required /></Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Label>Longitude<Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></Label>
          <Label>Latitude<Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></Label>
        </div>
        <Button type="button" variant="ghost" onClick={useMyLocation}>Use my location</Button>
        <div className="grid gap-4 sm:grid-cols-3">
          <Label>City<Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Label>
          <Label>State<Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Label>
          <Label>Pincode<Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></Label>
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
      </form>
    </div>
  );
}

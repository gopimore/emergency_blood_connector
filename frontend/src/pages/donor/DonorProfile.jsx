import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BLOOD_GROUPS } from '../../constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Alert, Button, Input, Label, PageHeader, Select } from '../../components/ui';

export default function DonorProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ bloodGroup: 'O+', longitude: '', latitude: '', medicalConditions: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    api.get('/donors/profile').then((res) => {
      const p = res.data.profile;
      setProfile(p);
      const [lng, lat] = p.location?.coordinates || ['', ''];
      setForm({ bloodGroup: p.bloodGroup, longitude: lng, latitude: lat, medicalConditions: (p.medicalConditions || []).join(', ') });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    try {
      const res = await api.patch('/donors/availability');
      setProfile(res.data.profile);
      const status = res.data.profile.isAvailable ? 'ON' : 'OFF';
      setMessage(`Availability: ${status}`);
      success('Availability updated', `Your availability is now ${status}.`);
    } catch (err) {
      const message = err?.message || 'Unable to update availability';
      setError(message);
      toastError('Availability failed', message);
    }
  };

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, longitude: pos.coords.longitude, latitude: pos.coords.latitude }));
        success('Location loaded', 'Your current coordinates were filled in.');
      },
      () => {
        const message = 'Could not get location';
        setError(message);
        toastError('Location failed', message);
      }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const body = {
        bloodGroup: form.bloodGroup,
        medicalConditions: form.medicalConditions.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (form.longitude && form.latitude) {
        body.location = { coordinates: [Number(form.longitude), Number(form.latitude)] };
      }
      const res = await api.patch('/donors/profile', body);
      setProfile(res.data.profile);
      setMessage('Profile saved');
      success('Profile saved', 'Your donor profile was updated successfully.');
    } catch (err) {
      const message = err?.message || 'Unable to save profile';
      setError(message);
      toastError('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <PageHeader
        title="Donor profile"
        action={
          <Button variant="secondary" onClick={toggleAvailability}>
            Toggle availability ({profile?.isAvailable ? 'ON' : 'OFF'})
          </Button>
        }
      />
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert>{error}</Alert>}
      <form onSubmit={handleSave} className="max-w-lg space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6">
        <Label>Blood group<Select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>{BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}</Select></Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Label>Longitude<Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></Label>
          <Label>Latitude<Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></Label>
        </div>
        <Button type="button" variant="ghost" onClick={useMyLocation}>Use my location</Button>
        <Label>Medical conditions (comma-separated)<Input value={form.medicalConditions} onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })} /></Label>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../../constants';
import { Alert, Button, Input, Label, PageHeader, Select } from '../../components/ui';

export default function CreateRequest() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState({ bloodGroup: 'O+', unitsRequired: 1, urgency: 'medium', longitude: '', latitude: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setForm((f) => ({ ...f, longitude: pos.coords.longitude, latitude: pos.coords.latitude }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/blood-requests', {
        bloodGroup: form.bloodGroup,
        unitsRequired: Number(form.unitsRequired),
        urgency: form.urgency,
        location: { coordinates: [Number(form.longitude), Number(form.latitude)] },
      });
      success('Request created', 'Hospital request was posted and donors have been notified.');
      navigate('/hospital/requests');
    } catch (err) {
      const message = err?.message || 'Unable to create request';
      setError(message);
      toastError('Create failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create blood request" subtitle="Nearby eligible donors will be notified in real time." />
      {error && <Alert>{error}</Alert>}
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6">
        <Label>Blood group<Select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>{BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}</Select></Label>
        <Label>Units required<Input type="number" min={1} value={form.unitsRequired} onChange={(e) => setForm({ ...form, unitsRequired: e.target.value })} required /></Label>
        <Label>Urgency<Select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>{URGENCY_LEVELS.map((u) => <option key={u} value={u}>{u}</option>)}</Select></Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Label>Longitude<Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required /></Label>
          <Label>Latitude<Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required /></Label>
        </div>
        <Button type="button" variant="ghost" onClick={useMyLocation}>Use hospital location</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create request'}</Button>
      </form>
    </div>
  );
}

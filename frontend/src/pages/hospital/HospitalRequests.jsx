import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Alert, Badge, Button, Card, EmptyState, PageHeader } from '../../components/ui';
import { cn } from '../../lib/cn';

export default function HospitalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const { success, error: toastError } = useToast();

  const load = () => api.get('/hospitals/requests?limit=50').then((res) => setRequests(res.data.requests));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    setError('');
    try {
      await api.patch(`/blood-requests/${id}/status`, { status });
      await load();
      success('Request updated', status === 'fulfilled' ? 'Request marked fulfilled.' : 'Request cancelled.');
    } catch (err) {
      const message = err?.message || 'Unable to update request';
      setError(message);
      toastError('Update failed', message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <PageHeader title="My blood requests" />
      {error && <Alert>{error}</Alert>}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <EmptyState>No requests yet.</EmptyState>
        ) : (
          requests.map((req) => (
            <Card key={req._id}>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="text-xl font-bold text-red-400">{req.bloodGroup}</span>
                <span className={cn('rounded px-2 py-0.5 text-xs uppercase', req.urgency === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-slate-300')}>{req.urgency}</span>
                <Badge>{req.status}</Badge>
              </div>
              <p className="text-slate-300">{req.unitsRequired} unit(s) · {req.respondents?.length || 0} response(s)</p>
              {req.respondents?.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-sm text-slate-500">
                  {req.respondents.map((r, i) => (
                    <li key={i}>Donor …{r.donorId?.toString?.().slice(-6)} — {r.status}</li>
                  ))}
                </ul>
              )}
              {req.status !== 'fulfilled' && req.status !== 'cancelled' && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" disabled={updating === req._id} onClick={() => updateStatus(req._id, 'fulfilled')}>Mark fulfilled</Button>
                  <Button variant="ghost" size="sm" disabled={updating === req._id} onClick={() => updateStatus(req._id, 'cancelled')}>Cancel</Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

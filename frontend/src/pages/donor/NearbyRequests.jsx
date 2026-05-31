import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Alert, Badge, Button, Card, EmptyState, PageHeader } from '../../components/ui';
import { cn } from '../../lib/cn';

function UrgencyBadge({ urgency }) {
  const colors = { low: 'bg-green-500/20 text-green-400', medium: 'bg-amber-500/20 text-amber-400', critical: 'bg-red-500/20 text-red-300' };
  return <span className={cn('rounded px-2 py-0.5 text-xs font-semibold uppercase', colors[urgency])}>{urgency}</span>;
}

export default function NearbyRequests() {
  const [requests, setRequests] = useState([]);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responding, setResponding] = useState(null);
  const { success, error: toastError } = useToast();

  const loadRequests = async (lng, lat) => {
    const res = await api.get(`/blood-requests/nearby?longitude=${lng}&latitude=${lat}&limit=20`);
    setRequests(res.data.requests);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await api.get('/donors/profile');
        const coordsFromProfile = profileRes.data.profile?.location?.coordinates;
        if (coordsFromProfile?.length === 2) {
          const [lng, lat] = coordsFromProfile;
          setCoords({ lng, lat });
          await loadRequests(lng, lat);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              setCoords({ lng: pos.coords.longitude, lat: pos.coords.latitude });
              await loadRequests(pos.coords.longitude, pos.coords.latitude);
              setLoading(false);
            },
            () => {
          const message = 'Set your location in Profile';
          setError(message);
          toastError('Location required', message);
          setLoading(false);
        }
          );
          return;
        } else setError('Set your location in Profile');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleRespond = async (id) => {
    setResponding(id);
    setError('');
    try {
      await api.patch(`/blood-requests/${id}/respond`);
      if (coords) await loadRequests(coords.lng, coords.lat);
      success('Response sent', 'The hospital was notified that you can donate.');
    } catch (err) {
      const message = err?.message || 'Unable to respond';
      setError(message);
      toastError('Response failed', message);
    } finally {
      setResponding(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <PageHeader title="Nearby blood requests" />
      {error && <Alert>{error}</Alert>}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <EmptyState>No open requests nearby.</EmptyState>
        ) : (
          requests.map((req) => (
            <Card key={req._id}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold text-red-400">{req.bloodGroup}</span>
                <UrgencyBadge urgency={req.urgency} />
                <Badge>{req.status}</Badge>
              </div>
              <p className="text-white"><strong>{req.hospitalId?.hospitalName}</strong> needs {req.unitsRequired} unit(s)</p>
              <p className="text-sm text-slate-400">{req.hospitalId?.contactPhone}</p>
              <Button className="mt-4" size="sm" disabled={responding === req._id} onClick={() => handleRespond(req._id)}>
                {responding === req._id ? 'Responding…' : 'I can donate'}
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

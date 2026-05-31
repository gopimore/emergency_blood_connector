import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Badge, Card, EmptyState, PageHeader } from '../../components/ui';

export default function DonationHistory() {
  const [history, setHistory] = useState([]);
  const [donationCount, setDonationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/donors/history').then((res) => {
      setHistory(res.data.history);
      setDonationCount(res.data.donationCount);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <PageHeader title="Donation history" subtitle={`Total donations: ${donationCount}`} />
      <div className="space-y-4">
        {history.length === 0 ? (
          <EmptyState>No fulfilled donations yet.</EmptyState>
        ) : (
          history.map((item) => (
            <Card key={item.requestId}>
              <div className="mb-2 flex gap-2">
                <span className="text-lg font-bold text-red-400">{item.bloodGroup}</span>
                <Badge>{item.urgency}</Badge>
              </div>
              <p className="font-medium text-white">{item.hospital?.hospitalName}</p>
              <p className="text-sm text-slate-400">
                Responded {new Date(item.respondedAt).toLocaleDateString()} · Fulfilled {new Date(item.fulfilledAt).toLocaleDateString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

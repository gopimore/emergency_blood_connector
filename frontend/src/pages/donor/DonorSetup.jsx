import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS } from '../../constants';
import { Alert, Button, Label, Select } from '../../components/ui';

export default function DonorSetup() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/donors/setup', { bloodGroup });
      await refreshUser();
      navigate('/donor');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-white">Complete your donor profile</h1>
      <p className="mt-2 text-slate-400">
        Your account was created but the donor profile step did not finish. Choose your blood
        group to continue.
      </p>

      {error && <Alert className="mt-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6">
        <Label>
          Blood group
          <Select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </Select>
        </Label>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Continue to dashboard'}
        </Button>
      </form>
    </div>
  );
}

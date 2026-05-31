import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BLOOD_GROUPS } from '../constants';
import { Alert, Button, Input, Label, Select } from '../components/ui';
import { cn } from '../lib/cn';

export default function Register() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState('donor');
  const [form, setForm] = useState({
    name: '', email: '', password: '', bloodGroup: 'O+',
    hospitalName: '', registrationNo: '', contactPhone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'donor') payload.bloodGroup = form.bloodGroup;
      if (role === 'hospital') {
        payload.hospitalName = form.hospitalName;
        payload.registrationNo = form.registrationNo;
        payload.contactPhone = form.contactPhone;
      }
      const user = await register(payload);
      success('Created account', 'You are now signed in.');
      if (user.role === 'donor') {
        navigate('/donor');
      } else {
        navigate(`/${user.role}`);
      }
    } catch (err) {
      const msg = err?.message || 'Registration failed';
      const userMessage = msg.includes('already in use')
        ? `${msg} — try signing in instead; you may need to complete donor setup.`
        : msg;
      setError(userMessage);
      toastError('Registration failed', userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-950/40 to-slate-950 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="mt-1 text-slate-400">Join as a donor or hospital</p>

        {error && <Alert>{error}</Alert>}

        <div className="mt-4 flex gap-2">
          {['donor', 'hospital'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                'flex-1 rounded-lg border py-2 text-sm capitalize transition',
                role === r
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Label>Name<Input value={form.name} onChange={update('name')} required /></Label>
          <Label>Email<Input type="email" value={form.email} onChange={update('email')} required /></Label>
          <Label>Password<Input type="password" value={form.password} onChange={update('password')} minLength={8} required /></Label>

          {role === 'donor' && (
            <Label>
              Blood group
              <Select value={form.bloodGroup} onChange={update('bloodGroup')}>
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </Select>
            </Label>
          )}

          {role === 'hospital' && (
            <>
              <Label>Hospital name<Input value={form.hospitalName} onChange={update('hospitalName')} required /></Label>
              <Label>Registration no.<Input value={form.registrationNo} onChange={update('registrationNo')} required /></Label>
              <Label>Contact phone<Input value={form.contactPhone} onChange={update('contactPhone')} required /></Label>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-red-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

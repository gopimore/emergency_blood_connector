import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Alert, Button, Input, Label } from '../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-950/40 to-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-1 text-slate-400">We will email a reset link if the account exists</p>

        {error && <Alert>{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Label>
            Email
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-red-400 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

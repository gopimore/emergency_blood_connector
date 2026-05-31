import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Input, Label } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'donor') {
        navigate('/donor');
      } else {
        navigate(`/${user.role}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-red-950/40 to-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-slate-400">Sign in to Emergency Blood Connector</p>

        {error && <Alert>{error}</Alert>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Label>
            Email
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </Label>
          <Label>
            Password
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </Label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/" className="text-slate-500 hover:underline">← Home</Link>
          {' · '}
          <Link to="/forgot-password" className="text-red-400 hover:underline">Forgot password?</Link>
          {' · '}
          <Link to="/register" className="text-red-400 hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}

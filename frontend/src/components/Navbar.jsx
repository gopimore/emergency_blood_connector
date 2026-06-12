import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/useSocket';
import { useToast } from '../context/ToastContext';
import { Button } from './ui';
import { cn } from '../lib/cn';

const donorLinks = [
  { to: '/donor', label: 'Dashboard', end: true },
  { to: '/donor/requests', label: 'Nearby Requests' },
  { to: '/donor/history', label: 'History' },
  { to: '/donor/profile', label: 'Profile' },
];

const hospitalLinks = [
  { to: '/hospital', label: 'Dashboard', end: true },
  { to: '/hospital/requests', label: 'My Requests' },
  { to: '/hospital/create', label: 'Create Request' },
  { to: '/hospital/donors', label: 'Find Donors' },
  { to: '/hospital/profile', label: 'Profile' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
];

export default function Navbar() {
  const { user, logout, needsProfileSetup } = useAuth();
  const { liveNotifications } = useSocket();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const links = needsProfileSetup
    ? [{ to: '/donor/setup', label: 'Complete setup', end: true }]
    : user?.role === 'donor'
      ? donorLinks
      : user?.role === 'hospital'
        ? hospitalLinks
        : adminLinks;

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out', 'You have been signed out successfully.');
      navigate('/login');
    } catch (err) {
      error('Logout failed', err?.message || 'Unable to sign out.');
    }
  };

  const linkClass = ({ isActive }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm transition',
      isActive
        ? 'bg-slate-800 text-white'
        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
    );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 lg:px-6">
        <Link
          to={`/${user?.role}`}
          className="flex items-center gap-2 font-bold text-white hover:text-red-400"
        >
          <span className="text-xl">🩸</span>
          <span className="hidden sm:inline">Emergency Blood Connector</span>
          <span className="sm:hidden">EBC</span>
        </Link>

        <nav className="flex flex-1 flex-wrap gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/notifications" className={linkClass}>
            Notifications
            {liveNotifications.length > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
                {liveNotifications.length}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <span className="rounded bg-red-600 px-2 py-0.5 text-xs capitalize text-white">
            {user?.role}
          </span>
          <span className="hidden text-slate-400 md:inline">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DonorGuard() {
  const { needsProfileSetup } = useAuth();
  const { pathname } = useLocation();

  if (needsProfileSetup && pathname !== '/donor/setup') {
    return <Navigate to="/donor/setup" replace />;
  }

  if (!needsProfileSetup && pathname === '/donor/setup') {
    return <Navigate to="/donor" replace />;
  }

  return <Outlet />;
}

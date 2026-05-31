import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Notifications from './pages/Notifications';

import DonorDashboard from './pages/donor/DonorDashboard';
import DonorProfile from './pages/donor/DonorProfile';
import NearbyRequests from './pages/donor/NearbyRequests';
import DonationHistory from './pages/donor/DonationHistory';
import DonorSetup from './pages/donor/DonorSetup';
import DonorGuard from './components/DonorGuard';

import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalProfile from './pages/hospital/HospitalProfile';
import CreateRequest from './pages/hospital/CreateRequest';
import HospitalRequests from './pages/hospital/HospitalRequests';
import FindDonors from './pages/hospital/FindDonors';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import Home from './pages/Home';

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
            <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/notifications" element={<Notifications />} />
                <Route element={<ProtectedRoute roles={['donor']} />}>
                  <Route element={<DonorGuard />}>
                    <Route path="/donor/setup" element={<DonorSetup />} />
                    <Route path="/donor" element={<DonorDashboard />} />
                    <Route path="/donor/profile" element={<DonorProfile />} />
                    <Route path="/donor/requests" element={<NearbyRequests />} />
                    <Route path="/donor/history" element={<DonationHistory />} />
                  </Route>
                </Route>
                <Route element={<ProtectedRoute roles={['hospital']} />}>
                  <Route path="/hospital" element={<HospitalDashboard />} />
                  <Route path="/hospital/profile" element={<HospitalProfile />} />
                  <Route path="/hospital/create" element={<CreateRequest />} />
                  <Route path="/hospital/requests" element={<HospitalRequests />} />
                  <Route path="/hospital/donors" element={<FindDonors />} />
                </Route>
                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

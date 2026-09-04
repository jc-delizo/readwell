import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import UserContext from '../UserContext';
import Loading from './Loading';

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, isLoading } = useContext(UserContext);
  const location = useLocation();

  if (isLoading) return <Loading label="Checking your session" fullPage />;
  if (!user.id) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

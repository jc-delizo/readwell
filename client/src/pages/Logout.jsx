import { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from '../UserContext';

export default function Logout() {
  const { signOut } = useContext(UserContext);
  useEffect(() => signOut(), [signOut]);
  return <Navigate to="/login" replace />;
}

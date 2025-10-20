import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/UserContext';
import Spinner from './Spinner';

const GuestRoute = () => {
  const { user, loading } = useUser();

  if (loading) return <Spinner />;

  if (user?.role === "Admin") return <Navigate to="/dashboard" replace />;
  if (user?.role === "Supplier") return <Navigate to="/supplier/orders" replace />;

  return <Outlet />;
};

export default GuestRoute;

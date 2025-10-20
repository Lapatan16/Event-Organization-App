import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/UserContext';

const RoleRedirect = () => {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "Admin") return <Navigate to="/dashboard" replace />;
  if (user.role === "Supplier") return <Navigate to="/supplier/orders" replace />;

  return <Navigate to="/unauthorized" replace />;
};

export default RoleRedirect;

import { Navigate, Outlet, useLocation } from 'react-router';
import type { Role } from '@farabitech/contracts';
import { Forbidden, LoadingState } from '@farabitech/ui';
import { useAuth } from './AuthProvider';

/** Layout route: renders children only for signed-in users, else redirects to /login. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState fullPage />;
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/** Layout route: renders children only when the user has one of the roles. */
export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Forbidden />;
  return <Outlet />;
}

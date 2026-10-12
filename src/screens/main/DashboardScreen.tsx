import { Navigate } from 'react-router-dom';

export function DashboardScreen() {
  return <Navigate to="/journal?view=stats" replace />;
}

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Spinner from "./Spinner.jsx";

// Redirect already-logged-in users away from login/register
export default function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner fullscreen />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

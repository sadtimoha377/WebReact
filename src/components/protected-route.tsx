import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth-context.js";
import type { Role } from "../api/types/auth.js";

interface ProtectedRouteProps {
    roles?: Role[];
}

const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-4">Session is loading...</div>
    if (!user) return <Navigate to="/login" replace />
    if (roles && !roles.includes(user.role)) return <Navigate to="/requests" replace />

    return <Outlet />
}

export default ProtectedRoute;

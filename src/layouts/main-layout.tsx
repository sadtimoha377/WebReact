import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.js";

const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "border px-2 bg-gray-300 font-bold" : "border px-2 bg-gray-100";

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="font-bold mr-4">Service Requests</h1>
                    <NavLink to="/requests" end className={linkClass}>Requests</NavLink>
                    {user?.role === "user" && (
                        <NavLink to="/requests/new" className={linkClass}>New request</NavLink>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span>{user?.fullName} ({user?.role})</span>
                    <button className="border px-2 bg-gray-200" onClick={handleLogout}>Logout</button>
                </div>
            </header>
            <main className="grow p-4">
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout;

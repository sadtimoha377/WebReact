import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AuthService } from "../api/auth-service.js";
import { UNAUTHORIZED_EVENT } from "../api/api-instance.js";
import type { LoginDto, User } from "../api/types/auth.js";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (dto: LoginDto) => Promise<User>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }
        const controller = new AbortController();
        AuthService.getMe(controller.signal)
            .then((me) => setUser(me))
            .catch(() => {
                if (controller.signal.aborted) return;
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                setUser(null);
            })
            .finally(() => {
                if (controller.signal.aborted) return;
                setLoading(false);
            })
        return () => controller.abort();
    }, [])

    useEffect(() => {
        const handleUnauthorized = () => setUser(null);
        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    }, [])

    const login = async (dto: LoginDto): Promise<User> => {
        const response = await AuthService.login(dto);
        localStorage.setItem("token", response.accessToken);
        localStorage.setItem("role", response.user.role);
        const me = await AuthService.getMe(new AbortController().signal);
        setUser(me);
        return me;
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}

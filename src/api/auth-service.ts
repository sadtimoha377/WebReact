import api from "./api-instance.js";
import type { LoginDto, LoginResponse, User } from "./types/auth.js";

export class AuthService {
    static login = async (dto: LoginDto): Promise<LoginResponse> => {
        const response = await api.post("/auth/login", dto);
        return response.data;
    }
    static getMe = async (signal: AbortSignal): Promise<User> => {
        const response = await api.get("/auth/me", { signal });
        return response.data;
    }
}

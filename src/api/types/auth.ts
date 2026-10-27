export type Role = "user" | "operator";

export interface User {
    id: number;
    email: string;
    fullName: string;
    role: Role;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}

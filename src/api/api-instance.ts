import axios from "axios";

export const API_URL = "https://6ad91121f89c5702ed9a696c.mockapi.io/api/final";

export const UNAUTHORIZED_EVENT = "unauthorized";

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
        }
        return Promise.reject(error);
    }
)

export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (!error.response) return "Network error. Check your connection";
        return error.response.data?.message ?? `Server error ${error.response.status}`;
    }
    if (error instanceof Error) return error.message;
    return "Unknown error";
}

export default api;

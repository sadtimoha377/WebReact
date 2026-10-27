import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./app.js";
import { AuthProvider } from "./context/auth-context.js";
import { NotificationProvider } from "./context/notification-context.js";
import { worker } from "./mocks/browser.js";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found");
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
});

await worker.start({ onUnhandledRequest: "bypass" });

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </NotificationProvider>
        </QueryClientProvider>
    </React.StrictMode>
)

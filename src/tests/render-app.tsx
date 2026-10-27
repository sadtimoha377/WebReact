import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "../app.js";
import { AuthProvider } from "../context/auth-context.js";
import { NotificationProvider } from "../context/notification-context.js";

export const renderApp = (path: string) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false
            }
        }
    });
    const router = createMemoryRouter(routes, { initialEntries: [path] });

    return render(
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </NotificationProvider>
        </QueryClientProvider>
    )
}

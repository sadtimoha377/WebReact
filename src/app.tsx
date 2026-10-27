import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from "react-router-dom";
import PublicLayout from "./layouts/public-layout.js";
import MainLayout from "./layouts/main-layout.js";
import ProtectedRoute from "./components/protected-route.js";
import LoginPage from "./pages/login-page.js";
import RequestsPage from "./pages/requests-page.js";
import NewRequestPage from "./pages/new-request-page.js";
import RequestDetailsPage from "./pages/request-details-page.js";
import NotFoundPage from "./pages/not-found-page.js";

export const routes: RouteObject[] = [
    {
        element: <PublicLayout />,
        children: [
            {
                path: "login",
                element: <LoginPage />
            },
            {
                path: "not-found",
                element: <NotFoundPage />
            }
        ]
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/requests" replace />
                    },
                    {
                        path: "requests",
                        element: <RequestsPage />
                    },
                    {
                        path: "requests/:id",
                        element: <RequestDetailsPage />
                    },
                    {
                        element: <ProtectedRoute roles={["user"]} />,
                        children: [
                            {
                                path: "requests/new",
                                element: <NewRequestPage />
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        path: "*",
        element: <Navigate to="/not-found" replace />
    }
]

const router = createBrowserRouter(routes);

const App = () => {
    return <RouterProvider router={router} />
}

export default App;

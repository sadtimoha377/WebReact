import { Outlet } from "react-router-dom";

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b p-2">
                <h1 className="font-bold">Service Requests</h1>
            </header>
            <main className="grow p-4">
                <Outlet />
            </main>
        </div>
    )
}

export default PublicLayout;

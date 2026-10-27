import { createContext, useContext, useState, type ReactNode } from "react";

type NotificationType = "success" | "error";

interface Notification {
    id: number;
    type: NotificationType;
    message: string;
}

interface NotificationContextType {
    showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = (id: number) => {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
    }

    const showNotification = (message: string, type: NotificationType) => {
        const id = Date.now() + Math.random();
        setNotifications((prev) => [...prev, { id, type, message }]);
        setTimeout(() => removeNotification(id), 3000);
    }

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-2 right-2 flex flex-col gap-2">
                {notifications.map((item) => (
                    <div
                        key={item.id}
                        role="alert"
                        className={`border p-2 ${item.type === "success" ? "bg-green-200" : "bg-red-200"}`}
                    >
                        {item.message}
                        <button className="ml-2 border px-1" onClick={() => removeNotification(item.id)}>x</button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    )
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used inside NotificationProvider");
    }
    return context;
}

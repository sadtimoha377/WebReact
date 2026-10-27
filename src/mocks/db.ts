import type { User } from "../api/types/auth.js";
import type {
    Category,
    OperatorComment,
    Priority,
    RequestStatus,
    ServiceRequest,
    StatusHistoryItem
} from "../api/types/requests.js";

export interface DbUser extends User {
    password: string;
}

interface Db {
    users: DbUser[];
    sessions: Record<string, number>;
    categories: Category[];
    priorities: Priority[];
    statuses: RequestStatus[];
    requests: ServiceRequest[];
    comments: OperatorComment[];
    history: StatusHistoryItem[];
}

const createInitialData = (): Db => {
    const categories: Category[] = [
        { id: 1, name: "Hardware" },
        { id: 2, name: "Software" },
        { id: 3, name: "Network" }
    ];
    const priorities: Priority[] = [
        { id: 1, name: "Low" },
        { id: 2, name: "Medium" },
        { id: 3, name: "High" }
    ];
    const statuses: RequestStatus[] = [
        { id: 1, name: "New" },
        { id: 2, name: "In progress" },
        { id: 3, name: "Resolved" },
        { id: 4, name: "Closed" }
    ];
    const [hardware, software, network] = categories as [Category, Category, Category];
    const [low, medium, high] = priorities as [Priority, Priority, Priority];
    const [statusNew, inProgress, resolved, closed] = statuses as [RequestStatus, RequestStatus, RequestStatus, RequestStatus];

    return {
        users: [
            { id: 1, email: "john@gmail.com", password: "john123", fullName: "John Smith", role: "user" },
            { id: 2, email: "timofey@admin.com", password: "timofey123", fullName: "Timofey", role: "operator" },
            { id: 3, email: "anna@gmail.com", password: "anna123", fullName: "Anna Brown", role: "user" }
        ],
        sessions: {},
        categories,
        priorities,
        statuses,
        requests: [
            {
                id: 1,
                title: "Printer does not print",
                description: "Office printer shows paper jam error all the time",
                category: hardware,
                priority: high,
                status: inProgress,
                userId: 1,
                createdAt: "2026-10-10T09:15:00.000Z",
                contactName: "John Smith",
                contactPhone: "+380501112233",
                contactEmail: "user@example.com"
            },
            {
                id: 2,
                title: "Cannot install antivirus",
                description: "Installer stops at 50 percent with unknown error",
                category: software,
                priority: medium,
                status: statusNew,
                userId: 1,
                createdAt: "2026-10-12T11:30:00.000Z",
                contactName: "John Smith",
                contactPhone: "+380501112233",
                contactEmail: "user@example.com"
            },
            {
                id: 3,
                title: "No internet in meeting room",
                description: "Wi-Fi in meeting room 2 is not available",
                category: network,
                priority: low,
                status: resolved,
                userId: 1,
                createdAt: "2026-10-05T14:00:00.000Z",
                contactName: "John Smith",
                contactPhone: "+380501112233",
                contactEmail: "user@example.com"
            },
            {
                id: 4,
                title: "Monitor flickers",
                description: "Second monitor flickers after laptop wakes up",
                category: hardware,
                priority: medium,
                status: closed,
                userId: 3,
                createdAt: "2026-10-01T08:45:00.000Z",
                contactName: "Anna Brown",
                contactPhone: "+380671234567",
                contactEmail: "anna@example.com"
            },
            {
                id: 5,
                title: "VPN disconnects",
                description: "VPN connection drops every 10 minutes",
                category: network,
                priority: high,
                status: statusNew,
                userId: 3,
                createdAt: "2026-10-15T16:20:00.000Z",
                contactName: "Anna Brown",
                contactPhone: "+380671234567",
                contactEmail: "anna@example.com"
            }
        ],
        comments: [
            {
                id: 1,
                requestId: 1,
                authorName: "Olga Operator",
                text: "Technician will come tomorrow morning",
                createdAt: "2026-10-10T12:00:00.000Z"
            },
            {
                id: 2,
                requestId: 3,
                authorName: "Olga Operator",
                text: "Access point was restarted, please check",
                createdAt: "2026-10-06T10:00:00.000Z"
            }
        ],
        history: [
            {
                id: 1,
                requestId: 1,
                fromStatus: null,
                toStatus: statusNew,
                changedBy: "John Smith",
                changedAt: "2026-10-10T09:15:00.000Z"
            },
            {
                id: 2,
                requestId: 1,
                fromStatus: statusNew,
                toStatus: inProgress,
                changedBy: "Olga Operator",
                changedAt: "2026-10-10T11:50:00.000Z"
            },
            {
                id: 3,
                requestId: 3,
                fromStatus: statusNew,
                toStatus: resolved,
                changedBy: "Olga Operator",
                changedAt: "2026-10-06T10:00:00.000Z"
            },
            {
                id: 4,
                requestId: 4,
                fromStatus: resolved,
                toStatus: closed,
                changedBy: "Olga Operator",
                changedAt: "2026-10-03T09:00:00.000Z"
            }
        ]
    }
}

export const db: Db = createInitialData();

export const resetDb = () => {
    Object.assign(db, createInitialData());
}

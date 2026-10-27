import { delay, http, HttpResponse } from "msw";
import { API_URL } from "../api/api-instance.js";
import { db, type DbUser } from "./db.js";
import type { LoginDto, LoginResponse, User } from "../api/types/auth.js";
import type {
    AddCommentDto,
    ChangeStatusDto,
    CreateRequestDto,
    OperatorComment,
    ServiceRequest,
    ServiceRequestDetails,
    StatusHistoryItem
} from "../api/types/requests.js";

const SERVER_ERROR_REQUEST_ID = 999;
const NETWORK_ERROR_REQUEST_ID = 998;
const SERVER_ERROR_TITLE = "error 500";

const toUser = ({ password, ...user }: DbUser): User => user;

const createToken = (user: DbUser) => `mock-token-${user.id}`;

const getCurrentUser = (request: Request): DbUser | undefined => {
    const header = request.headers.get("Authorization");
    if (!header || !header.startsWith("Bearer mock-token-")) return undefined;
    const userId = Number(header.replace("Bearer mock-token-", ""));
    return db.users.find((user) => user.id === userId);
}

const errorResponse = (status: number, message: string) => HttpResponse.json({ message }, { status });

const unauthorized = () => errorResponse(401, "Unauthorized");
const forbidden = () => errorResponse(403, "Access denied");
const notFound = () => errorResponse(404, "Request not found");

const filterByStatus = (requests: ServiceRequest[], url: string) => {
    const statusId = new URL(url).searchParams.get("statusId");
    if (!statusId) return requests;
    return requests.filter((item) => item.status.id === Number(statusId));
}

const canSeeRequest = (user: DbUser, serviceRequest: ServiceRequest) =>
    user.role === "operator" || serviceRequest.userId === user.id;

const nextId = (items: { id: number }[]) => items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

export const handlers = [
    http.post(`${API_URL}/auth/login`, async ({ request }) => {
        const body = await request.json() as Partial<LoginDto>;
        const user = db.users.find((item) => item.email === body.email && item.password === body.password);
        if (!user) return errorResponse(401, "Invalid email or password");
        const response: LoginResponse = { accessToken: createToken(user), user: toUser(user) };
        return HttpResponse.json(response);
    }),

    http.get(`${API_URL}/auth/me`, ({ request }) => {
        const user = getCurrentUser(request);
        if (!user) return unauthorized();
        return HttpResponse.json(toUser(user));
    }),

    http.get(`${API_URL}/categories`, ({ request }) => {
        if (!getCurrentUser(request)) return unauthorized();
        return HttpResponse.json(db.categories);
    }),

    http.get(`${API_URL}/priorities`, ({ request }) => {
        if (!getCurrentUser(request)) return unauthorized();
        return HttpResponse.json(db.priorities);
    }),

    http.get(`${API_URL}/request-statuses`, ({ request }) => {
        if (!getCurrentUser(request)) return unauthorized();
        return HttpResponse.json(db.statuses);
    }),

    http.get(`${API_URL}/requests/my`, async ({ request }) => {
        const user = getCurrentUser(request);
        if (!user) return unauthorized();
        await delay(800);
        const myRequests = db.requests.filter((item) => item.userId === user.id);
        return HttpResponse.json(filterByStatus(myRequests, request.url));
    }),

    http.get(`${API_URL}/requests`, async ({ request }) => {
        const user = getCurrentUser(request);
        if (!user) return unauthorized();
        if (user.role !== "operator") return forbidden();
        await delay(800);
        return HttpResponse.json(filterByStatus(db.requests, request.url));
    }),

    http.get(`${API_URL}/requests/:id`, ({ request, params }) => {
        const user = getCurrentUser(request);
        if (!user) return unauthorized();
        const id = Number(params.id);
        if (id === SERVER_ERROR_REQUEST_ID) return errorResponse(500, "Internal server error");
        if (id === NETWORK_ERROR_REQUEST_ID) return HttpResponse.error();
        const serviceRequest = db.requests.find((item) => item.id === id);
        if (!serviceRequest) return notFound();
        if (!canSeeRequest(user, serviceRequest)) return forbidden();
        const details: ServiceRequestDetails = {
            ...serviceRequest,
            comments: db.comments.filter((item) => item.requestId === id)
        };
        return HttpResponse.json(details);
    }),

    http.post(`${API_URL}/requests`, async ({ request }) => {
        const user = getCurrentUser(request);
        if (!user) return unauthorized();
        if (user.role !== "user") return forbidden();
        const body = await request.json() as Partial<CreateRequestDto>;
        if (body.title?.trim().toLowerCase() === SERVER_ERROR_TITLE) {
            return errorResponse(500, "Internal server error");
        }
        const category = db.categories.find((item) => item.id === body.categoryId);
        const priority = db.priorities.find((item) => item.id === body.priorityId);
        const status = db.statuses[0];
        if (!body.title || !body.description || !body.contactName || !body.contactPhone || !body.contactEmail || !category || !priority || !status) {
            return errorResponse(400, "Invalid request data");
        }
        const newRequest: ServiceRequest = {
            id: nextId(db.requests),
            title: body.title,
            description: body.description,
            category,
            priority,
            status,
            userId: user.id,
            createdAt: new Date().toISOString(),
            contactName: body.contactName,
            contactPhone: body.contactPhone,
            contactEmail: body.contactEmail
        };
        const historyItem: StatusHistoryItem = {
            id: nextId(db.history),
            requestId: newRequest.id,
            fromStatus: null,
            toStatus: status,
            changedBy: user.fullName,
            changedAt: newRequest.createdAt
        };
        db.requests = [newRequest, ...db.requests];
        db.history = [...db.history, historyItem];
        return HttpResponse.json(newRequest, { status: 201 });
    }),

    http.patch(`${API_URL}/requests/:id/status`, async ({ request, params }) => {
        const user = getCurrentUser(request);
        if (!user) return unauthorized();
        if (user.role !== "operator") return forbidden();
        const id = Number(params.id);
        const serviceRequest = db.requests.find((item) => item.id === id);
        if (!serviceRequest) return notFound();
        const body = await request.json() as Partial<ChangeStatusDto>;
        const newStatus = db.statuses.find((item) => item.id === body.statusId);
        if (!newStatus) return errorResponse(400, "Unknown status");
        if (newStatus.id === serviceRequest.status.id) return errorResponse(400, "Request already has this status");
        const updatedRequest: ServiceRequest = { ...serviceRequest, status: newStatus };
        const historyItem: StatusHistoryItem = {
            id: nextId(db.history),
            requestId: id,
            fromStatus: serviceRequest.status,
            toStatus: newStatus,
            changedBy: user.fullName,
            changedAt: new Date().toISOString()
        };
        db.requests = db.requests.map((item) => item.id === id ? updatedRequest : item);
        db.history = [...db.history, historyItem];
        return HttpResponse.json(updatedRequest);
    }),

    http.post(`${API_URL}/requests/:id/comments`, async ({ request, params }) => {
        const user = getCurrentUser(request);
        if (!user) return unauthorized();
        if (user.role !== "operator") return forbidden();
        const id = Number(params.id);
        if (!db.requests.some((item) => item.id === id)) return notFound();
        const body = await request.json() as Partial<AddCommentDto>;
        if (!body.text || !body.text.trim()) return errorResponse(400, "Comment text is required");
        const comment: OperatorComment = {
            id: nextId(db.comments),
            requestId: id,
            authorName: user.fullName,
            text: body.text.trim(),
            createdAt: new Date().toISOString()
        };
        db.comments = [...db.comments, comment];
        return HttpResponse.json(comment, { status: 201 });
    }),

    http.get(`${API_URL}/requests/:id/history`, ({ request, params }) => {
        const user = getCurrentUser(request);
        if (!user) return unauthorized();
        const id = Number(params.id);
        const serviceRequest = db.requests.find((item) => item.id === id);
        if (!serviceRequest) return notFound();
        if (!canSeeRequest(user, serviceRequest)) return forbidden();
        return HttpResponse.json(db.history.filter((item) => item.requestId === id));
    })
]

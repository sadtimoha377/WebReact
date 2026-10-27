import api from "./api-instance.js";
import type {
    AddCommentDto,
    Category,
    ChangeStatusDto,
    CreateRequestDto,
    OperatorComment,
    Priority,
    RequestStatus,
    ServiceRequest,
    ServiceRequestDetails,
    StatusHistoryItem
} from "./types/requests.js";

const statusParams = (statusId: number | null) => statusId ? { statusId } : {};

export class RequestsService {
    static getMyRequests = async (statusId: number | null, signal: AbortSignal): Promise<ServiceRequest[]> => {
        const response = await api.get("/requests/my", { params: statusParams(statusId), signal });
        return response.data;
    }
    static getAllRequests = async (statusId: number | null, signal: AbortSignal): Promise<ServiceRequest[]> => {
        const response = await api.get("/requests", { params: statusParams(statusId), signal });
        return response.data;
    }
    static getRequestById = async (id: number, signal: AbortSignal): Promise<ServiceRequestDetails> => {
        const response = await api.get(`/requests/${id}`, { signal });
        return response.data;
    }
    static getHistory = async (id: number, signal: AbortSignal): Promise<StatusHistoryItem[]> => {
        const response = await api.get(`/requests/${id}/history`, { signal });
        return response.data;
    }
    static createRequest = async (dto: CreateRequestDto): Promise<ServiceRequest> => {
        const response = await api.post("/requests", dto);
        return response.data;
    }
    static changeStatus = async (id: number, dto: ChangeStatusDto): Promise<ServiceRequest> => {
        const response = await api.patch(`/requests/${id}/status`, dto);
        return response.data;
    }
    static addComment = async (id: number, dto: AddCommentDto): Promise<OperatorComment> => {
        const response = await api.post(`/requests/${id}/comments`, dto);
        return response.data;
    }
    static getCategories = async (signal: AbortSignal): Promise<Category[]> => {
        const response = await api.get("/categories", { signal });
        return response.data;
    }
    static getPriorities = async (signal: AbortSignal): Promise<Priority[]> => {
        const response = await api.get("/priorities", { signal });
        return response.data;
    }
    static getStatuses = async (signal: AbortSignal): Promise<RequestStatus[]> => {
        const response = await api.get("/request-statuses", { signal });
        return response.data;
    }
}

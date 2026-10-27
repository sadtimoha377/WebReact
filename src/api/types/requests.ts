export interface Category {
    id: number;
    name: string;
}

export interface Priority {
    id: number;
    name: string;
}

export interface RequestStatus {
    id: number;
    name: string;
}

export interface ServiceRequest {
    id: number;
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    status: RequestStatus;
    userId: number;
    createdAt: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
}

export interface OperatorComment {
    id: number;
    requestId: number;
    authorName: string;
    text: string;
    createdAt: string;
}

export interface ServiceRequestDetails extends ServiceRequest {
    comments: OperatorComment[];
}

export interface StatusHistoryItem {
    id: number;
    requestId: number;
    fromStatus: RequestStatus | null;
    toStatus: RequestStatus;
    changedBy: string;
    changedAt: string;
}

export interface CreateRequestDto {
    title: string;
    description: string;
    categoryId: number;
    priorityId: number;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
}

export interface ChangeStatusDto {
    statusId: number;
}

export interface AddCommentDto {
    text: string;
}

export interface ApiErrorDto {
    message: string;
}

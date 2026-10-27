import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { RequestsService } from "../api/requests-service.js";
import { getErrorMessage } from "../api/api-instance.js";
import { useAuth } from "../context/auth-context.js";
import ChangeStatusForm from "../components/change-status-form.js";
import AddCommentForm from "../components/add-comment-form.js";
import type { ServiceRequestDetails, StatusHistoryItem } from "../api/types/requests.js";

const formatDate = (value: string) => new Date(value).toLocaleString("en-GB");

const RequestDetailsPage = () => {
    const { id } = useParams();
    const requestId = Number(id);
    const { user } = useAuth();
    const isOperator = user?.role === "operator";

    const { data: details, isLoading, isError, error } = useQuery<ServiceRequestDetails, Error>({
        queryKey: ["request", requestId],
        queryFn: ({ signal }) => RequestsService.getRequestById(requestId, signal)
    })

    const { data: history, isLoading: isHistoryLoading, isError: isHistoryError } = useQuery<StatusHistoryItem[], Error>({
        queryKey: ["request-history", requestId],
        queryFn: ({ signal }) => RequestsService.getHistory(requestId, signal),
        enabled: Boolean(details)
    })

    if (isLoading) return <div>Request is loading...</div>
    if (isError) return (
        <div>
            <p className="text-red-900">Error: {getErrorMessage(error)}</p>
            <Link className="underline" to="/requests">Back to requests</Link>
        </div>
    )
    if (!details) return null

    return (
        <div className="flex flex-col gap-2">
            <Link className="underline" to="/requests">Back to requests</Link>
            <h2 className="text-xl font-bold">#{details.id} {details.title}</h2>
            <div className="border p-1">
                <p>Status: <b>{details.status.name}</b></p>
                <p>Priority: {details.priority.name}</p>
                <p>Category: {details.category.name}</p>
                <p>Created: {formatDate(details.createdAt)}</p>
                <p>Description: {details.description}</p>
            </div>
            <div className="border p-1">
                <h3 className="font-bold">Contact</h3>
                <p>Name: {details.contactName}</p>
                <p>Phone: {details.contactPhone}</p>
                <p>Email: {details.contactEmail}</p>
            </div>

            {isOperator && <ChangeStatusForm requestId={details.id} currentStatusId={details.status.id} />}
            <hr />

            <h3 className="font-bold">Status history</h3>
            {isHistoryLoading && <p>History is loading...</p>}
            {isHistoryError && <p className="text-red-900">History was not loaded</p>}
            {history && history.length === 0 && <p>No history yet</p>}
            <ul>
                {history?.map((item) => (
                    <li key={item.id}>
                        {formatDate(item.changedAt)}: {item.fromStatus ? item.fromStatus.name : "Created"} {"->"} {item.toStatus.name} ({item.changedBy})
                    </li>
                ))}
            </ul>
            <hr />

            <h3 className="font-bold">Operator comments</h3>
            {details.comments.length === 0 && <p>No comments yet</p>}
            <ul className="flex flex-col gap-1">
                {details.comments.map((comment) => (
                    <li key={comment.id} className="border p-1">
                        <b>{comment.authorName}</b> ({formatDate(comment.createdAt)}): {comment.text}
                    </li>
                ))}
            </ul>

            {isOperator && <AddCommentForm requestId={details.id} />}
        </div>
    )
}

export default RequestDetailsPage;

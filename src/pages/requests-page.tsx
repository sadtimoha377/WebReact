import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { RequestsService } from "../api/requests-service.js";
import { getErrorMessage } from "../api/api-instance.js";
import { useAuth } from "../context/auth-context.js";
import type { RequestStatus, ServiceRequest } from "../api/types/requests.js";

const RequestsPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const isOperator = user?.role === "operator";
    const statusParam = searchParams.get("status");
    const statusId = statusParam ? Number(statusParam) : null;

    const { data: statuses } = useQuery<RequestStatus[], Error>({
        queryKey: ["request-statuses"],
        queryFn: ({ signal }) => RequestsService.getStatuses(signal)
    })

    const { data: requests, isLoading, isError, error } = useQuery<ServiceRequest[], Error>({
        queryKey: ["requests", isOperator ? "all" : "my", statusId],
        queryFn: ({ signal }) => isOperator
            ? RequestsService.getAllRequests(statusId, signal)
            : RequestsService.getMyRequests(statusId, signal)
    })

    const buttonClass = (active: boolean) => `border px-2 ${active ? "bg-gray-400 font-bold" : "bg-gray-200"}`;

    return (
        <div>
            <h2 className="text-xl font-bold mb-2">{isOperator ? "All requests" : "My requests"}</h2>

            <div className="flex gap-2 mb-2">
                <button className={buttonClass(statusId === null)} onClick={() => setSearchParams({})}>All</button>
                {statuses?.map((status) => (
                    <button
                        key={status.id}
                        className={buttonClass(statusId === status.id)}
                        onClick={() => setSearchParams({ status: String(status.id) })}
                    >
                        {status.name}
                    </button>
                ))}
            </div>
            <hr />

            {isLoading && <div className="mt-2">Requests are loading...</div>}
            {isError && <div className="mt-2 text-red-900">Error: {getErrorMessage(error)}</div>}
            {requests && requests.length === 0 && <div className="mt-2">No requests found</div>}
            {requests && requests.length > 0 && (
                <ul className="mt-2 flex flex-col gap-2">
                    {requests.map((item) => (
                        <li key={item.id} className="border p-1">
                            <Link className="underline font-bold" to={`/requests/${item.id}`}>
                                #{item.id} {item.title}
                            </Link>
                            <div>Status: {item.status.name} | Priority: {item.priority.name} | Category: {item.category.name}</div>
                            <div>Created: {new Date(item.createdAt).toLocaleString("en-GB")}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default RequestsPage;

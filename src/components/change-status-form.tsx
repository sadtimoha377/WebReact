import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RequestsService } from "../api/requests-service.js";
import { getErrorMessage } from "../api/api-instance.js";
import { useNotification } from "../context/notification-context.js";
import type { RequestStatus } from "../api/types/requests.js";

interface ChangeStatusFormProps {
    requestId: number;
    currentStatusId: number;
}

const ChangeStatusForm = ({ requestId, currentStatusId }: ChangeStatusFormProps) => {
    const [selectedStatusId, setSelectedStatusId] = useState(currentStatusId);
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const { data: statuses } = useQuery<RequestStatus[], Error>({
        queryKey: ["request-statuses"],
        queryFn: ({ signal }) => RequestsService.getStatuses(signal)
    })

    const mutation = useMutation({
        mutationFn: (statusId: number) => RequestsService.changeStatus(requestId, { statusId }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ["request", requestId] });
            queryClient.invalidateQueries({ queryKey: ["request-history", requestId] });
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            showNotification(`Status changed to "${updated.status.name}"`, "success");
        },
        onError: (error) => {
            showNotification(`Status change failed: ${getErrorMessage(error)}`, "error");
        }
    })

    return (
        <div className="flex gap-2 items-center">
            <label htmlFor="status">Change status:</label>
            <select
                id="status"
                className="border p-1"
                value={selectedStatusId}
                onChange={(event) => setSelectedStatusId(Number(event.target.value))}
            >
                {statuses?.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                ))}
            </select>
            <button
                className="border px-2 bg-gray-200"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(selectedStatusId)}
            >
                {mutation.isPending ? "Saving..." : "Save status"}
            </button>
        </div>
    )
}

export default ChangeStatusForm;

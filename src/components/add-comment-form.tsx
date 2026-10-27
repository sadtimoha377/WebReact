import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestsService } from "../api/requests-service.js";
import { getErrorMessage } from "../api/api-instance.js";
import { useNotification } from "../context/notification-context.js";

interface AddCommentFormProps {
    requestId: number;
}

const AddCommentForm = ({ requestId }: AddCommentFormProps) => {
    const [text, setText] = useState("");
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const mutation = useMutation({
        mutationFn: (commentText: string) => RequestsService.addComment(requestId, { text: commentText }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["request", requestId] });
            setText("");
            showNotification("Comment added", "success");
        },
        onError: (error) => {
            showNotification(`Comment was not added: ${getErrorMessage(error)}`, "error");
        }
    })

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutation.mutate(text);
    }

    return (
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <label htmlFor="comment">New comment</label>
            <textarea
                id="comment"
                className="border p-1"
                value={text}
                onChange={(event) => setText(event.target.value)}
            />
            <button type="submit" className="border px-2 bg-gray-200 w-fit" disabled={mutation.isPending || !text.trim()}>
                {mutation.isPending ? "Sending..." : "Add comment"}
            </button>
        </form>
    )
}

export default AddCommentForm;

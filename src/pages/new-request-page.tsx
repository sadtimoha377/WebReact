import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RequestsService } from "../api/requests-service.js";
import { getErrorMessage } from "../api/api-instance.js";
import { useNotification } from "../context/notification-context.js";
import { requestSchema, type RequestFormData } from "../schemas/requestSchema.js";
import type { Category, Priority } from "../api/types/requests.js";

const NewRequestPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError } = useQuery<Category[], Error>({
        queryKey: ["categories"],
        queryFn: ({ signal }) => RequestsService.getCategories(signal)
    })

    const { data: priorities, isLoading: isPrioritiesLoading, isError: isPrioritiesError } = useQuery<Priority[], Error>({
        queryKey: ["priorities"],
        queryFn: ({ signal }) => RequestsService.getPriorities(signal)
    })

    const { register, handleSubmit, formState: { errors } } = useForm<RequestFormData>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            title: "",
            description: "",
            contactName: "",
            contactPhone: "",
            contactEmail: ""
        }
    });

    const mutation = useMutation({
        mutationFn: (data: RequestFormData) => RequestsService.createRequest(data),
        onSuccess: (created) => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            showNotification(`Request #${created.id} created`, "success");
            navigate(`/requests/${created.id}`);
        },
        onError: (error) => {
            showNotification(`Request was not created: ${getErrorMessage(error)}`, "error");
        }
    })

    const onSubmit: SubmitHandler<RequestFormData> = (data) => {
        mutation.mutate(data);
    }

    if (isCategoriesLoading || isPrioritiesLoading) return <div>Form data is loading...</div>
    if (isCategoriesError || isPrioritiesError) return <div className="text-red-900">Error: form data was not loaded</div>

    return (
        <div className="max-w-md">
            <h2 className="text-xl font-bold mb-2">New request</h2>
            <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="title">Title</label>
                <input id="title" className="border p-1" {...register("title")} />
                {errors.title && <p className="text-red-900">{errors.title.message}</p>}

                <label htmlFor="description">Description</label>
                <textarea id="description" className="border p-1" {...register("description")} />
                {errors.description && <p className="text-red-900">{errors.description.message}</p>}

                <label htmlFor="categoryId">Category</label>
                <select id="categoryId" className="border p-1" {...register("categoryId", { valueAsNumber: true })}>
                    <option value="">Select category</option>
                    {categories?.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                {errors.categoryId && <p className="text-red-900">{errors.categoryId.message}</p>}

                <label htmlFor="priorityId">Priority</label>
                <select id="priorityId" className="border p-1" {...register("priorityId", { valueAsNumber: true })}>
                    <option value="">Select priority</option>
                    {priorities?.map((priority) => (
                        <option key={priority.id} value={priority.id}>{priority.name}</option>
                    ))}
                </select>
                {errors.priorityId && <p className="text-red-900">{errors.priorityId.message}</p>}

                <label htmlFor="contactName">Contact name</label>
                <input id="contactName" className="border p-1" {...register("contactName")} />
                {errors.contactName && <p className="text-red-900">{errors.contactName.message}</p>}

                <label htmlFor="contactPhone">Contact phone</label>
                <input id="contactPhone" className="border p-1" {...register("contactPhone")} />
                {errors.contactPhone && <p className="text-red-900">{errors.contactPhone.message}</p>}

                <label htmlFor="contactEmail">Contact email</label>
                <input id="contactEmail" className="border p-1" {...register("contactEmail")} />
                {errors.contactEmail && <p className="text-red-900">{errors.contactEmail.message}</p>}

                <button type="submit" className="border px-2 bg-gray-200" disabled={mutation.isPending}>
                    {mutation.isPending ? "Sending..." : "Create request"}
                </button>
            </form>
        </div>
    )
}

export default NewRequestPage;

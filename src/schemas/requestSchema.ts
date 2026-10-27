import { z } from "zod";

export const requestSchema = z.object({
    title: z.string().trim().min(5, "Title must have 5 symbols minimum").max(100, "Title must have 100 symbols maximum"),
    description: z.string().trim().min(10, "Description must have 10 symbols minimum"),
    categoryId: z.number("Select a category").min(1, "Select a category"),
    priorityId: z.number("Select a priority").min(1, "Select a priority"),
    contactName: z.string().trim().min(2, "Contact name must have 2 symbols minimum"),
    contactPhone: z.string().trim().regex(/^\+?[0-9]{10,13}$/, "Enter a valid phone number"),
    contactEmail: z.email("Enter a valid email")
});

export type RequestFormData = z.infer<typeof requestSchema>;

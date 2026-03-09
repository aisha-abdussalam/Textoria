import { z } from "zod";

const createPostSchema = z.object({
    title: z.string().trim().min(1, "Title is required").min(5, "Title is a bit too short")
        .max(100, "Title is too long (keep it under 100 characters)"),
    content: z.string().trim().min(1, "Content cannot be empty"),
    // categories: z.array(z.string({ error: "All categories must be strings" }).toLowerCase().trim()).default([]),
    categories: z.string("All categories must be strings").toLowerCase().trim().transform((str) => {
        try {
            const parsed = JSON.parse(str);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return str ? [str] : [];
        }
    })
})

const updatePostSchema = z.object({
    title: z.string().trim().min(1, "Title is required").min(5, "Title is a bit too short")
        .max(100, "Title is too long (keep it under 100 characters)"),
    content: z.string().trim().min(1, "Content cannot be empty"),
    comment: z.string().trim().optional(),
    categories: z.string().toLowerCase().trim().transform((str) => {
        try {
            const parsed = JSON.parse(str);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return str ? [str] : [];
        }
    }).refine((arr) => arr.every(item => typeof item === 'string'), {
        message: "All categories must be strings"
    })
})

export { createPostSchema, updatePostSchema };
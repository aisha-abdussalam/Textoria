import { z } from "zod";

const createCommentSchema = z.object({
    content: z.string().trim().min(1, "Comment cannot be empty").max(500, "Comment too long")
})

const updateCommentSchema = z.object({
    content: z.string().trim().min(1, "Comment cannot be empty").max(500, "Comment too long")
})


export { createCommentSchema, updateCommentSchema };
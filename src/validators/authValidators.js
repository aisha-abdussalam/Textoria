import { z } from "zod";

const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least two characters"),
    email: z.string().min(1, "Email is required").email("Please provide a valid email").toLowerCase(),
    password: z.string().min(1,"Password is required").min(6, "Password must be at least 6 characters")
})

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please provide a valid email").toLowerCase(),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters")
})

export { registerSchema, loginSchema };
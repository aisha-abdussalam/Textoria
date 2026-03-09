import { z } from "zod";

const updateSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least two characters"),
})

export { updateSchema };
import { z } from "zod";

const saveProfileSchema = z.object({
    bio: z.string().optional()
})


export { saveProfileSchema };
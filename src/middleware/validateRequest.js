export const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            // .flatten() gives you { fieldErrors: { email: ['...'], password: ['...'] } }
            const flatennedErrors = result.error.flatten().fieldErrors;

            // Turn { email: ['err1'], pass: ['err2'] } into ['err1', 'err2']
            const errorMessages = Object.values(flatennedErrors).flat();

            return res.status(400).json({
                message: errorMessages.join(", ")
            });
        }

        // This ensures the controller ONLY sees the fields in your schema
        req.body = result.data;
        next();
    }
}
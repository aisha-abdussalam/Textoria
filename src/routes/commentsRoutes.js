import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createComment, getCommentsByPost, deleteComment } from "../controller/commentsControllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createCommentSchema, updateCommentSchema } from "../validators/commentsValidators.js";

const router = express.Router();

router.get('/all/:id', getCommentsByPost)
router.post('/:id', authMiddleware, validateRequest(createCommentSchema), createComment)
router.delete('/:id', authMiddleware, deleteComment)

export default router;
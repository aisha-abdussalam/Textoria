import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createPost, getPosts, getMyDrafts, getPost, toggleLike, updatePost, deletePost } from "../controller/postControllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createPostSchema, updatePostSchema } from "../validators/postValidators.js";
import { upload } from "../middleware/cloudinary.js";

const router = express.Router();

router.post('/', authMiddleware, upload.single('posterUrl'), validateRequest(createPostSchema), createPost)
router.get('/', getPosts);
router.get('/my-drafts', authMiddleware, getMyDrafts);
router.post('/like/:id', authMiddleware, toggleLike);
router.get('/:id', getPost);
router.put('/:id', authMiddleware, upload.single('posterUrl'), validateRequest(updatePostSchema), updatePost);
router.delete('/:id', authMiddleware, deletePost);

export default router;
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getUsers, getUser, getMe, updateUser, deleteUser } from "../controller/userControllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updateSchema } from "../validators/userValidators.js";

const router = express.Router();

router.get('/all', authMiddleware, getUsers)
router.get('/me', authMiddleware, getMe)
router.delete('/delete/:id', authMiddleware, deleteUser)
router.get('/:id', getUser)
router.put('/:id', authMiddleware, validateRequest(updateSchema), updateUser)

export default router;
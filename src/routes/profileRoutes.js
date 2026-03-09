import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { saveProfile, getProfile } from "../controller/profileControllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { saveProfileSchema } from "../validators/profileValidators.js";
import { upload } from "../middleware/cloudinary.js";

const router = express.Router();

router.post('/save', authMiddleware, upload.single('profileUrl'), validateRequest(saveProfileSchema), saveProfile)
router.get('/:id', getProfile)

export default router;
import { Router } from "express";
import {
  uploadResume,
  getActiveResume,
  getAllResumes,
  deleteResume,
} from "../controllers/resume.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

router.use(protect);

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/active", getActiveResume);
router.get("/", getAllResumes);
router.delete("/:id", deleteResume);

export default router;

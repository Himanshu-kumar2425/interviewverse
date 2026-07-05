import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getStats,
  updateProfileValidators,
} from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect); // all user routes require auth

router.get("/profile", getProfile);
router.put("/profile", updateProfileValidators, validate, updateProfile);
router.get("/stats", getStats);

export default router;

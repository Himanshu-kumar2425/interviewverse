import { Router } from "express";
import {
  register,
  login,
  getMe,
  registerValidators,
  loginValidators,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerValidators, validate, register);
router.post("/login", loginValidators, validate, login);
router.get("/me", protect, getMe);

export default router;

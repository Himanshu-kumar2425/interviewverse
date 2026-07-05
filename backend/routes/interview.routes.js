import { Router } from "express";
import {
  startSession,
  submitAnswer,
  endSession,
  getMySessions,
  getSession,
  startSessionValidators,
} from "../controllers/interview.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getMySessions);
router.post("/start", startSessionValidators, validate, startSession);
router.get("/:sessionId", getSession);
router.post("/:sessionId/answer", submitAnswer);
router.post("/:sessionId/end", endSession);

export default router;

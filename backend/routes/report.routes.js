import { Router } from "express";
import {
  getMyReports,
  getReportBySession,
  submitHumanFeedback,
  humanFeedbackValidators,
} from "../controllers/report.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getMyReports);
router.get("/:sessionId", getReportBySession);
router.post("/:sessionId/human-feedback", humanFeedbackValidators, validate, submitHumanFeedback);

export default router;

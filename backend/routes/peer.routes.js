import { Router } from "express";
import {
  createPeerSession,
  joinPeerSession,
  endPeerSession,
  getSessionByRoom,
} from "../controllers/peer.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/create", createPeerSession);
router.post("/join/:roomId", joinPeerSession);
router.get("/:roomId", getSessionByRoom);
router.post("/:sessionId/end", endPeerSession);

export default router;

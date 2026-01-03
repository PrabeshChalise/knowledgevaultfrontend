import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  getPending,
  submitForReview,
  decision,
} from "../controllers/governanceController.js";

const router = express.Router();

router.use(protect);

router.get("/pending", requireRole("admin", "reviewer"), getPending);
router.post("/submit", submitForReview);
router.post("/decision", requireRole("admin", "reviewer"), decision);

export default router;

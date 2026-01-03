import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAutoRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

router.use(protect);
router.get("/auto", getAutoRecommendations);

export default router;

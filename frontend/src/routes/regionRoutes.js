import express from "express";
import Region from "../models/Region.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: list regions (used by signup)
router.get("/", async (req, res) => {
  try {
    const regions = await Region.find().sort({ regionName: 1 }).lean();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin only: create region
router.post("/", protect, requireRole("admin"), async (req, res) => {
  try {
    const { regionName } = req.body;
    if (!regionName) {
      return res.status(400).json({ error: "regionName is required" });
    }
    const existing = await Region.findOne({ regionName });
    if (existing) {
      return res.status(400).json({ error: "Region already exists" });
    }
    const region = await Region.create({ regionName });
    res.status(201).json(region);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

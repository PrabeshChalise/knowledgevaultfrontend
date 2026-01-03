import mongoose from "mongoose";
import Artefact from "../models/Artefact.js";
import AuditLog from "../models/AuditLog.js";

const logAudit = async ({ actorId, regionId, action, targetType, targetId, details }) => {
  try {
    await AuditLog.create({
      actorId,
      regionId,
      action,
      targetType,
      targetId,
      details,
    });
  } catch (err) {
    console.error("Audit log error", err.message);
  }
};

export const submitForReview = async (req, res) => {
  try {
    const { artefactId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(artefactId)) {
      return res.status(400).json({ error: "Invalid artefact id" });
    }

    const artefact = await Artefact.findById(artefactId);
    if (!artefact || String(artefact.regionId) !== String(req.user.regionId)) {
      return res.status(404).json({ error: "Artefact not found" });
    }

    if (String(artefact.ownerId) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ error: "Only the owner can submit for review" });
    }

    artefact.status = "pending_review";
    artefact.reviewerDecision = null;
    await artefact.save();

    await logAudit({
      actorId: req.user.id,
      regionId: req.user.regionId,
      action: "artefact_submitted_for_review",
      targetType: "artefact",
      targetId: artefact._id,
      details: {},
    });

    res.json({ message: "Submitted for review" });
  } catch (err) {
    console.error("submitForReview error", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getPending = async (req, res) => {
  try {
    const artefacts = await Artefact.find({
      regionId: req.user.regionId,
      status: "pending_review",
      archived: false,
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(artefacts);
  } catch (err) {
    console.error("getPending error", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const decision = async (req, res) => {
  try {
    const { artefactId, decision, reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(artefactId)) {
      return res.status(400).json({ error: "Invalid artefact id" });
    }
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ error: "Decision must be approved or rejected" });
    }

    const artefact = await Artefact.findById(artefactId);
    if (!artefact || String(artefact.regionId) !== String(req.user.regionId)) {
      return res.status(404).json({ error: "Artefact not found" });
    }

    artefact.status = decision === "approved" ? "approved" : "rejected";
    artefact.reviewerDecision = {
      reviewerId: req.user.id,
      decision,
      reason: reason || "",
      decidedAt: new Date(),
    };
    await artefact.save();

    await logAudit({
      actorId: req.user.id,
      regionId: req.user.regionId,
      action: "artefact_review_decision",
      targetType: "artefact",
      targetId: artefact._id,
      details: { decision, reason },
    });

    res.json({ message: `Artefact ${decision}` });
  } catch (err) {
    console.error("decision error", err);
    res.status(500).json({ error: "Server error" });
  }
};

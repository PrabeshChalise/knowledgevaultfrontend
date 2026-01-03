import mongoose from "mongoose";

const ReviewerDecisionSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decision: {
      type: String,
      enum: ["approved", "rejected"],
    },
    reason: { type: String, default: "" },
    decidedAt: { type: Date },
  },
  { _id: false }
);

const ArtefactSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    classification: {
      type: String,
      enum: ["open", "restricted", "confidential"],
      default: "open",
    },
    status: {
      // lifecycle from governance perspective
      type: String,
      enum: ["draft", "pending_review", "approved", "rejected"],
      default: "draft",
    },
    lifecycleStatus: {
      type: String,
      enum: ["active", "deprecated", "archived"],
      default: "active",
    },
    latestVersionNumber: { type: Number, default: 1 },
    reviewerDecision: { type: ReviewerDecisionSchema, default: null },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true,
      index: true,
    },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ArtefactSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Artefact", ArtefactSchema);

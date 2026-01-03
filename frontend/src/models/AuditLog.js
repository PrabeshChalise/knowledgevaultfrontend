import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    regionId: { type: mongoose.Schema.Types.ObjectId, ref: "Region" },
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", AuditLogSchema);

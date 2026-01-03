import mongoose from "mongoose";

const VersionSchema = new mongoose.Schema(
  {
    artefactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artefact",
      required: true,
    },
    versionNumber: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    changeNote: { type: String, default: "" },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

VersionSchema.index({ artefactId: 1, versionNumber: -1 });

export default mongoose.model("Version", VersionSchema);

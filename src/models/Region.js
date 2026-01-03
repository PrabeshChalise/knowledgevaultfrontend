import mongoose from "mongoose";

const RegionSchema = new mongoose.Schema(
  {
    regionName: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Region", RegionSchema);

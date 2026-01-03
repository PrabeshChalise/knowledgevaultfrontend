import Artefact from "../models/Artefact.js";

export const getAutoRecommendations = async (req, res) => {
  try {
    const { tag } = req.query;

    const query = {
      regionId: req.user.regionId,
      status: "approved",
      archived: false,
    };

    if (tag) {
      query.tags = tag;
    }

    const artefacts = await Artefact.find(query)
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    res.json(artefacts);
  } catch (err) {
    console.error("getAutoRecommendations error", err);
    res.status(500).json({ error: "Server error" });
  }
};

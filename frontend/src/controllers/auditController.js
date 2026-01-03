import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "user") {
      // Regular users: only see their own actions
      query.actorId = req.user.id;
    } else {
      // Admin / reviewer: see all logs in their region
      query.regionId = req.user.regionId;
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json(logs);
  } catch (err) {
    console.error("getAuditLogs error", err);
    res.status(500).json({ error: "Server error" });
  }
};

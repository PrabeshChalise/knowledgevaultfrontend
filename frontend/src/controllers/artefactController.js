import mongoose from "mongoose";
import Artefact from "../models/Artefact.js";
import Version from "../models/Version.js";
import AuditLog from "../models/AuditLog.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const toTagsArray = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

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

export const createArtefact = async (req, res) => {
  try {
    const { title, description, tags, classification } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "File upload is required" });
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "knowledge-vault",
      filename: `${Date.now()}-${req.file.originalname}`,
    });

    const artefact = await Artefact.create({
      title,
      description: description || "",
      tags: toTagsArray(tags),
      classification: classification || "open",
      status: "draft",
      lifecycleStatus: "active",
      latestVersionNumber: 1,
      ownerId: req.user.id,
      regionId: req.user.regionId,
    });

    await Version.create({
      artefactId: artefact._id,
      versionNumber: 1,
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      changeNote: "Initial upload",
    });

    await logAudit({
      actorId: req.user.id,
      regionId: req.user.regionId,
      action: "artefact_created",
      targetType: "artefact",
      targetId: artefact._id,
      details: { title },
    });

    res.status(201).json(artefact);
  } catch (err) {
    console.error("createArtefact error", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const listArtefacts = async (req, res) => {
  try {
    const {
      search,
      tag,
      status,
      classification,
      includeArchived,
    } = req.query;

    const query = {
      regionId: new mongoose.Types.ObjectId(req.user.regionId),
    };

    if (includeArchived !== "true") {
      query.archived = false;
    }

    if (status) {
      query.status = status;
    }

    if (classification) {
      query.classification = classification;
    }

    if (tag) {
      query.tags = tag;
    }

    // Access control: regular users see own artefacts + approved non-confidential of others
    if (req.user.role === "user") {
      query.$or = [
        { ownerId: new mongoose.Types.ObjectId(req.user.id) },
        {
          status: "approved",
          classification: { $ne: "confidential" },
        },
      ];
    }

    let mongoQuery = Artefact.find(query);

    if (search) {
      mongoQuery = mongoQuery.find({
        $text: { $search: search },
      });
    }

    const artefacts = await mongoQuery
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    res.json(artefacts);
  } catch (err) {
    console.error("listArtefacts error", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getArtefactById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid artefact id" });
    }

    const artefact = await Artefact.findOne({
      _id: id,
      regionId: req.user.regionId,
    }).lean();

    if (!artefact) {
      return res.status(404).json({ error: "Artefact not found" });
    }

    // Access control
    const isOwner = String(artefact.ownerId) === String(req.user.id);
    const isPrivileged = ["admin", "reviewer"].includes(req.user.role);

    if (!isPrivileged) {
      if (!isOwner) {
        if (artefact.status !== "approved") {
          return res
            .status(403)
            .json({ error: "You are not allowed to view this artefact" });
        }
        if (artefact.classification === "confidential") {
          return res
            .status(403)
            .json({ error: "Confidential artefact is restricted" });
        }
      }
    }

    const versions = await Version.find({ artefactId: id })
      .sort({ versionNumber: -1 })
      .lean();

    res.json({ ...artefact, versions });
  } catch (err) {
    console.error("getArtefactById error", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateArtefact = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid artefact id" });
    }

    const artefact = await Artefact.findById(id);
    if (!artefact || String(artefact.regionId) !== String(req.user.regionId)) {
      return res.status(404).json({ error: "Artefact not found" });
    }

    const isOwner = String(artefact.ownerId) === String(req.user.id);
    const isPrivileged = ["admin", "reviewer"].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
      return res
        .status(403)
        .json({ error: "You cannot update this artefact" });
    }

    const { title, description, tags, classification, lifecycleStatus } =
      req.body;

    if (title) artefact.title = title;
    if (description !== undefined) artefact.description = description;
    if (tags !== undefined) artefact.tags = toTagsArray(tags);
    if (classification) artefact.classification = classification;
    if (lifecycleStatus) artefact.lifecycleStatus = lifecycleStatus;

    await artefact.save();

    await logAudit({
      actorId: req.user.id,
      regionId: req.user.regionId,
      action: "artefact_updated",
      targetType: "artefact",
      targetId: artefact._id,
      details: { title: artefact.title },
    });

    res.json(artefact);
  } catch (err) {
    console.error("updateArtefact error", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const addArtefactVersion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid artefact id" });
    }

    const artefact = await Artefact.findById(id);
    if (!artefact || String(artefact.regionId) !== String(req.user.regionId)) {
      return res.status(404).json({ error: "Artefact not found" });
    }

    const isOwner = String(artefact.ownerId) === String(req.user.id);
    const isPrivileged = ["admin", "reviewer"].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
      return res
        .status(403)
        .json({ error: "You cannot add a version to this artefact" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "File upload is required" });
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "knowledge-vault",
      filename: `${Date.now()}-${req.file.originalname}`,
    });

    const nextVersion = (artefact.latestVersionNumber || 1) + 1;

    const version = await Version.create({
      artefactId: artefact._id,
      versionNumber: nextVersion,
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      changeNote: req.body.changeNote || "New version uploaded",
    });

    artefact.latestVersionNumber = nextVersion;
    // moving back to draft when a new version is uploaded until re-approved
    artefact.status = "draft";
    artefact.reviewerDecision = null;
    await artefact.save();

    await logAudit({
      actorId: req.user.id,
      regionId: req.user.regionId,
      action: "artefact_version_added",
      targetType: "artefact",
      targetId: artefact._id,
      details: { versionNumber: nextVersion },
    });

    res.status(201).json(version);
  } catch (err) {
    console.error("addArtefactVersion error", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const archiveArtefact = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid artefact id" });
    }

    const artefact = await Artefact.findById(id);
    if (!artefact || String(artefact.regionId) !== String(req.user.regionId)) {
      return res.status(404).json({ error: "Artefact not found" });
    }

    const isOwner = String(artefact.ownerId) === String(req.user.id);
    const isPrivileged = ["admin", "reviewer"].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
      return res
        .status(403)
        .json({ error: "You cannot archive this artefact" });
    }

    artefact.archived = true;
    artefact.archivedAt = new Date();
    artefact.lifecycleStatus = "archived";
    await artefact.save();

    await logAudit({
      actorId: req.user.id,
      regionId: req.user.regionId,
      action: "artefact_archived",
      targetType: "artefact",
      targetId: artefact._id,
      details: { title: artefact.title },
    });

    res.json({ message: "Artefact archived" });
  } catch (err) {
    console.error("archiveArtefact error", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const listTags = async (req, res) => {
  try {
    const tags = await Artefact.aggregate([
      {
        $match: {
          regionId: new mongoose.Types.ObjectId(req.user.regionId),
          archived: false,
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 100 },
      {
        $project: { _id: 0, tag: "$_id", count: 1 },
      },
    ]);

    res.json(tags);
  } catch (err) {
    console.error("listTags error", err);
    res.status(500).json({ error: "Server error" });
  }
};

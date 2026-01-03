import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  createArtefact,
  listArtefacts,
  getArtefactById,
  updateArtefact,
  addArtefactVersion,
  archiveArtefact,
  listTags,
} from "../controllers/artefactController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.get("/tags", listTags);
router.post("/", upload.single("file"), createArtefact);
router.get("/", listArtefacts);
router.get("/:id", getArtefactById);
router.put("/:id", updateArtefact);
router.post("/:id/versions", upload.single("file"), addArtefactVersion);
router.delete("/:id", archiveArtefact);

export default router;

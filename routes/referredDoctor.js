import express from "express";
import { createReferredDoctor, listReferredDoctors, updateReferredDoctor, deleteReferredDoctor } from "../controllers/referredDoctor.js";

const router = express.Router();

router.post("/", createReferredDoctor);
router.get("/", listReferredDoctors);
router.put("/:id", updateReferredDoctor);
router.delete("/:id", deleteReferredDoctor);

export default router;



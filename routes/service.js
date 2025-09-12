import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createServiceController,
  getAllServicesController,
  getServiceByIdController,
  updateServiceController,
  deleteServiceController,
} from "../controllers/service.js";

const router = express.Router();

router.post("/create", isAuthenticated, createServiceController);

router.get("/all", isAuthenticated, getAllServicesController);

router.post("/view", isAuthenticated, getServiceByIdController);

router.put("/update", isAuthenticated, updateServiceController);

router.delete("/delete", isAuthenticated, deleteServiceController);

export default router;



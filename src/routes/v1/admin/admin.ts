import express from "express";
import { getAllUsers } from "../../../controllers/admin/userController.js";
import { setMaintenance } from "../../../controllers/admin/systemController.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/maintenance", setMaintenance);
export default router;

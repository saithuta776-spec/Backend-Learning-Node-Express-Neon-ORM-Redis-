import authRoutes from "../../routes/v1/auth.js";
import adminRoutes from "./admin/admin.js";
import userRoutes from "../../routes/v1/api/index.js";
import { auth } from "../../middlewares/auth.js";
import { authorise } from "../../middlewares/authorise.js";
import express from "express";
import { maintenance } from "../../middlewares/maintenance.js";

const router = express.Router();

router.use(maintenance, authRoutes);
router.use("/admin", maintenance, auth, authorise(true, "ADMIN"), adminRoutes);
router.use("/user", maintenance, userRoutes);

export default router;

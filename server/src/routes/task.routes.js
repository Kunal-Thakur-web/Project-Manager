import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMyTasks } from "../controllers/task.controller.js";

const router = Router();
router.use(verifyJWT);

// Tasks assigned to the current user, across all of their projects.
router.route("/my-tasks").get(getMyTasks);

export default router;

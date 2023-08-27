import express from "express";
import Debuger from "./debuger";
/** IMPORT ROUTERS */

import { create_user, delete_user, login, refresh_login, update_user } from "./controllers/user_controller";
import { get_tasks, create_task, update_task } from "./controllers/task_controller";

import dotenv from "dotenv";
import authenticate_token from "./middlewares/authenticate_token";
dotenv.config();

const Debug = Debuger("Routes");
const router = express.Router();

/** --- ROUTES --- */
router.post("/user", create_user);
router.put("/user", authenticate_token, update_user);
router.delete("/user", authenticate_token, delete_user);
router.post("/login", login);
router.post("/refresh", refresh_login);

router.get("/tasks", authenticate_token, get_tasks);
router.post("/tasks", authenticate_token, create_task);
router.put("/tasks", authenticate_token, update_task);
/** SAMPLE */
export = router;

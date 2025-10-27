import { Router } from "express";

import { register, login } from "#v1/controllers/authController.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

export default authRouter;

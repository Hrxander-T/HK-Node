import { Router } from "express";

import authRouter from "#v1/routers/authRouter.js"
import transactionsRouter from "#v1/routers/transactionsRouter.js";

const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/transactions", transactionsRouter);

export default v1Router;
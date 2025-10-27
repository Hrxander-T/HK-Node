import express from "express";
import {
  addTransaction,
  getTransactions,
} from "#v1/controllers/transactionController.js";
import auth from "#v1/authMiddleware.js";
const router = express.Router();

router.post("/", auth, addTransaction);
router.get("/", auth, getTransactions);

export default router;

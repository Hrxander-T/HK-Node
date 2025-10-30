import express from "express";
import {
  addTransaction,
  getTransactions,
} from "#v1/controllers/transactionController.js";
import { deleteTransaction } from "#v1/controllers/deleteTransactionController.js";
import { updateTransaction } from "#v1/controllers/updateTransactionController.js";
import auth from "#v1/authMiddleware.js";
const router = express.Router();

router.post("/", auth, addTransaction);
router.get("/", auth, getTransactions);
router.delete("/:serverId", auth, deleteTransaction);
router.put("/:serverId", auth, updateTransaction); // delete



export default router;

import express from "express";
import {
  addCategory,
  getCategories,
  deleteCategories,
  updateCategory,
} from "#v1/controllers/categoryController.js";
import auth from "#v1/authMiddleware.js";
const router = express.Router();

router.post("/", auth, addCategory);
router.get("/", auth, getCategories);
router.delete("/:serverId", auth, deleteCategories);
router.put("/:serverId", auth, updateCategory); // delete



export default router;
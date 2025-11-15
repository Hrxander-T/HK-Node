import { ObjectId } from "mongodb";
import { getCategoriesCollection } from "#v1/models/categoriesModel.js";

const addCategory = async (req, res) => {
  try {
    const { name, type ,lastModified} = req.body;
    const categories = getCategoriesCollection();

    // Create new Category
    const newCategory = {
      userId: req.userId,
      name,
      type,
      lastModified,
    };

    const result = await categories.insertOne(newCategory);

    res.status(201).send({
      message: "Category added successfully",
      serverId: result.insertedId.toString(),
    });
  } catch (err) {
    console.error("Error adding Category:", err);
    res.status(500).send({ error: "Failed to add Category" });
  }
};

// ✅ Get all categories for sync
const getCategories = async (req, res) => {
  try {
    // 1. Get the last sync time from the client's query
    const { modifiedSince } = req.query;

    // 2. Build the base query
    const query = { userId: req.userId };

    // 3. If the client sent a time, add it to the query
    if (modifiedSince) {
      query.lastModified = { $gt: new Date(modifiedSince) };
    }
    
    // 4. Find all records matching the query
    const categories = getCategoriesCollection();
    const list = await categories.find(query).toArray();

    res.status(200).send(list);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).send({ error: "Failed to fetch categories" });
  }
};

// Delete Categories by serverId
const deleteCategories = async (req, res) => {
  try {
    const { serverId } = req.params;
    const categories = getCategoriesCollection();

    if (!ObjectId.isValid(serverId)) {
      return res.status(400).send({ error: "Invalid serverId" });
    }

    const result = await categories.deleteOne({
      _id: ObjectId.createFromHexString(serverId),
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "Category not found" });
    }

    res.status(200).send({
      message: "Category deleted successfully",
      serverId,
    });
  } catch (err) {
    console.error("Error deleting Category:", err);
    res.status(500).send({ error: "Failed to delete category" });
  }
};

//Update Category by serverId
const updateCategory = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { name, type, lastModified } = req.body;
    const categories = getCategoriesCollection();

    if (!ObjectId.isValid(serverId)) {
      return res.status(400).send({ error: "Invalid serverId" });
    }

    const existing = await categories.findOne({
      _id: ObjectId.createFromHexString(serverId),
      userId: req.userId,
    });

    if (!existing) {
      return res.status(404).send({ error: "Category not found" });
    }

    const clientLastModified = new Date(lastModified);

    if (existing.lastModified && existing.lastModified > clientLastModified) {
      return res.status(200).send({
        message: "Server version is newer, update ignored.",
      });
    }

    await categories.updateOne(
      { _id: ObjectId.createFromHexString(serverId), userId: req.userId },
      {
        $set: {
          name,
          type,
          lastModified: clientLastModified,
        },
      }
    );

    res.status(200).send({
      message: "Category updated successfully",
      serverId,
    });
  } catch (err) {
    console.error("Error updating Category:", err);
    res.status(500).send({ error: "Failed to update Category" });
  }
};

export { addCategory, getCategories, deleteCategories, updateCategory };

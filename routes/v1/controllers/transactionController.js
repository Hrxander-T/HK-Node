import { ObjectId } from "mongodb";
import { getTransactionsCollection } from "#v1/models/transactionsModel.js";

// ✅ Add Transaction (or update if exists)
const addTransaction = async (req, res) => {
  try {
    const { amount, description, categoryId, serverId } = req.body;
    const transactions = getTransactionsCollection();

    // Check if this transaction already exists (same serverId)
    let existing = null;
    if (serverId) {
      existing = await transactions.findOne({ _id: new ObjectId.createFromHexString(serverId), userId: req.userId });
    }

    let newVersion = 1;
    if (existing) {
      // Increment version if updating
      newVersion = parseInt(existing.version || "1") + 1;

      await transactions.updateOne(
        { _id: new ObjectId.createFromHexString(serverId), userId: req.userId },
        {
          $set: {
            amount,
            description,
            categoryId,
            date: new Date(),
            version: newVersion.toString(),
          },
        }
      );

      return res.status(200).send({
        message: "Transaction updated successfully",
        serverId,
        version: newVersion.toString(),
      });
    }

    // Create new transaction
    const newTx = {
      userId: req.userId,
      amount,
      description,
      categoryId,
      version: newVersion.toString(),
      date: new Date(),
    };

    const result = await transactions.insertOne(newTx);

    res.status(201).send({
      message: "Transaction added successfully",
      serverId: result.insertedId.toString(),
      version: newVersion.toString(),
    });
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(500).send({ error: "Failed to add transaction" });
  }
};

// ✅ Get all transactions for sync
const getTransactions = async (req, res) => {
  try {
    const transactions = getTransactionsCollection();
    const list = await transactions
      .find({ userId: req.userId })
      .sort({ date: -1 })
      .toArray();

    res.status(200).send(list);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).send({ error: "Failed to fetch transactions" });
  }
};

export { addTransaction, getTransactions };
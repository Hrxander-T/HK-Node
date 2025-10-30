import { ObjectId } from "mongodb";
import { getTransactionsCollection } from "#v1/models/transactionsModel.js";

// ✅ Update Transaction by serverId
const updateTransaction = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { amount, description, categoryID } = req.body;
    const transactions = getTransactionsCollection();

    if (!ObjectId.isValid(serverId)) {
      return res.status(400).send({ error: "Invalid serverId" });
    }

    const existing = await transactions.findOne({
      _id: new ObjectId.createFromHexString(serverId),
      userId: req.userId,
    });

    if (!existing) {
      return res.status(404).send({ error: "Transaction not found" });
    }

    const newVersion = parseInt(existing.version || "1") + 1;

    await transactions.updateOne(
      { _id: new ObjectId.createFromHexString(serverId), userId: req.userId },
      {
        $set: {
          amount,
          description,
          categoryID,
          version: newVersion.toString(),
          date: new Date(),
        },
      }
    );

    res.status(200).send({
      message: "Transaction updated successfully",
      serverId,
      version: newVersion.toString(),
    });
  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).send({ error: "Failed to update transaction" });
  }
};

export { updateTransaction };

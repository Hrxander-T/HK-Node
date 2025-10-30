import { ObjectId } from "mongodb";
import { getTransactionsCollection } from "#v1/models/transactionsModel.js";

// ✅ Delete Transaction by serverId
const deleteTransaction = async (req, res) => {
  try {
    const { serverId } = req.params;
    const transactions = getTransactionsCollection();

    if (!ObjectId.isValid(serverId)) {
      return res.status(400).send({ error: "Invalid serverId" });
    }

    const result = await transactions.deleteOne({
      _id: new ObjectId.createFromHexString(serverId),
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "Transaction not found" });
    }

    res.status(200).send({
      message: "Transaction deleted successfully",
      serverId,
    });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).send({ error: "Failed to delete transaction" });
  }
};

export { deleteTransaction };

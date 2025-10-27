import { getDB } from "#db";

const getTransactionsCollection = () => {
  const db = getDB();
  return db.collection("transactions");
};

export { getTransactionsCollection };

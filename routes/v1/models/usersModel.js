import { getDB } from "#db";

const getUsersCollection = () => {
  const db = getDB();
  return db.collection("users");
};

export { getUsersCollection };

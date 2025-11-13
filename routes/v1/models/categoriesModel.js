import { getDB } from "#db";

const getCategoriesCollection = () => {
  const db = getDB();
  return db.collection("categories");
};

export { getCategoriesCollection };

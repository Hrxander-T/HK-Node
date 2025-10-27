import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let db;
const uri = process.env.MONGODB_URI;

const connectDB = async () => {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  console.log("🟨 MongoDB connecting...");
  await client.connect();
  db = client.db("app");
  console.log("✅ MongoDB connected");
};

const getDB = () => {
  if (!db) throw new Error("Database not initialised!!!");
  return db;
};

export { connectDB, getDB };

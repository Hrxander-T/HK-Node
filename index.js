import express from "express";
import { connectDB } from "#db";
import v1Router from "#v1/v1Router.js";

const app = express();
app.use(express.json());
app.use("/api/v1/", v1Router);

const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0',async () => {
  console.log(`Server running at http://localhost:3000 or on port ${PORT}`);
  connectDB();
});

app.get('/test', (req, res) => {
  res.json({ message: 'Backend connection successful 🚀' });
});



import { getUsersCollection } from "#v1/models/usersModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
const jwt_secret = process.env.JWT_SECRET;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwt_secret, { expiresIn: "24h" });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const users = getUsersCollection();

  const user = await users.findOne({ username });
  if (!user)
    return res.status(400).json({
      success: false,
      message: "Invalid username or password",
    });

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid)
    return res.status(400).json({
      success: false,
      message: "Invalid username or password",
    });
  res.json({
    success: true,
    message: "Login successful",
    token: generateToken(user._id),
    version: user.version,
  });
};

const register = async (req, res) => {
  const { username, password } = req.body;
  const users = getUsersCollection();

  const exists = await users.findOne({ username });

  if (exists)
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  users
    .insertOne({ username, password: hashedPassword, version: "1" })
    .then((result) => {
      const jwtToken = generateToken(result.insertedId);
      res.json({
        success: true,
        message: "Registration successful",
        token: jwtToken,
      });
    })
    .catch(() => {
      res.status(500).json({
        success: false,
        message: "Error registering user",
      });
    });
};

export { login, register };

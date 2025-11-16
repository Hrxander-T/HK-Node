import { getUsersCollection } from "#v1/models/usersModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();
const jwt_secret = process.env.JWT_SECRET;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwt_secret, { expiresIn: "120h" });
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

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // This is the Google idToken from Flutter

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "No token provided" });
    }

    // 1. Verify the Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Your Web Client ID
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // 2. Find or Create User
    const users = getUsersCollection();
    let user = await users.findOne({ email: email });

    if (!user) {
      // User doesn't exist, create a new one
      const newUser = {
        googleId: sub, // The user's unique Google ID
        email: email,
        username: email, // Use email as the username for uniqueness
        name: name,
        profilePic: picture,
        version: "1", // Match your register logic
        // No password is set, this user must log in via Google
      };
      const result = await users.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
    }

    // 3. Generate *our* app token
    const appToken = generateToken(user._id);

    // 4. Send back the token and user info
    // Match the response format of your 'login' function
    res.json({
      success: true,
      message: "Login successful",
      token: appToken,
      version: user.version,
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ success: false, message: "Invalid Google token" });
  }
};

export { login, register ,googleLogin};

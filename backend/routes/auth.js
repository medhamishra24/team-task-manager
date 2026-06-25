const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { asyncHandler, verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      throw new Error("Username and password are required.");
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      res.status(409);
      throw new Error("Username already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = (await User.countDocuments()) === 0 ? "admin" : "member";

    const user = await User.create({
      username: username.trim(),
      passwordHash,
      role,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "task-manager-secret",
      { expiresIn: "12h" }
    );

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      throw new Error("Username and password are required.");
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials.");
    }

    const passwordHash = user.passwordHash || user.password;
    const passwordMatch = passwordHash
      ? await bcrypt.compare(password, passwordHash)
      : false;

    if (!passwordMatch) {
      res.status(401);
      throw new Error("Invalid credentials.");
    }

    if (!user.passwordHash) {
      user.passwordHash = await bcrypt.hash(password, 10);
      user.password = undefined;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || "task-manager-secret",
      { expiresIn: "12h" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  })
);

router.get(
  "/me",
  verifyToken,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

module.exports = router;

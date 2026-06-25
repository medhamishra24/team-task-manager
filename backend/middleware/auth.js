const jwt = require("jsonwebtoken");
const User = require("../models/user");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401);
    throw new Error("Authorization token is required.");
  }

  const secret = process.env.JWT_SECRET || "task-manager-secret";
  let payload;

  try {
    payload = jwt.verify(token, secret);
  } catch (err) {
    res.status(401);
    throw new Error("Invalid or expired authorization token.");
  }

  const user = await User.findById(payload.userId).select("-passwordHash");
  if (!user) {
    res.status(401);
    throw new Error("User not found.");
  }

  req.user = user;
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error("Forbidden: insufficient privileges.");
  }
  next();
};

module.exports = {
  asyncHandler,
  verifyToken,
  requireRole,
};

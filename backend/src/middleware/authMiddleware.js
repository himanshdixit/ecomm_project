import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import { config } from "../config/env.js";
import User from "../models/User.js";

const AUTH_COOKIE_NAME = "token";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const token = req.cookies?.[AUTH_COOKIE_NAME] || bearerToken;

  if (!token) {
    res.status(401);
    throw new Error("Authentication required.");
  }

  const decoded = jwt.verify(token, config.jwtSecret);
  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    res.status(401);
    throw new Error("User for this token no longer exists.");
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error("You are not allowed to access this resource.");
  }

  next();
};

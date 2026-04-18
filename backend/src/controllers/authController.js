import asyncHandler from "express-async-handler";

import { config } from "../config/env.js";
import User from "../models/User.js";
import { signToken } from "../services/tokenService.js";
import { serializeUser } from "../utils/serializers.js";

const AUTH_COOKIE_NAME = "token";
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.nodeEnv === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sendAuthResponse = (res, statusCode, message, user) => {
  const token = signToken({ userId: user._id, role: user.role });

  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: serializeUser(user),
    },
  });
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "user",
  });

  sendAuthResponse(res, 201, "Registration successful.", user);
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  sendAuthResponse(res, 200, "Login successful.", user);
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.nodeEnv === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile fetched successfully.",
    data: {
      user: serializeUser(req.user),
    },
  });
});

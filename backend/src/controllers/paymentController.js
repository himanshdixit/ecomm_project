import asyncHandler from "express-async-handler";

import { PAYMENT_METHODS } from "../constants/index.js";

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const paymentMethod = req.body.paymentMethod || PAYMENT_METHODS.MOCK_PAY;

  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400);
    throw new Error("A valid payment amount is required.");
  }

  res.status(200).json({
    success: true,
    message: "Mock payment approved.",
    data: {
      paymentIntent: {
        id: `mock_${Date.now()}`,
        amount,
        currency: "USD",
        status: "succeeded",
        paymentMethod,
        emailAddress: req.user.email,
      },
    },
  });
});

import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";
const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ONE_WEEK_IN_SECONDS,
});

export async function POST(request) {
  let token = "";

  try {
    const payload = await request.json();
    token = String(payload?.token || "").trim();
  } catch {
    token = "";
  }

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Token is required.",
      },
      { status: 400 }
    );
  }

  const response = NextResponse.json({
    success: true,
    message: "Frontend session synchronized.",
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, getCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Frontend session cleared.",
  });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });

  return response;
}

import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminUsername || !adminPassword || !sessionSecret) {
      console.error("Admin authentication environment variables are missing.");

      return NextResponse.json(
        { success: false, message: "Server configuration error." },
        { status: 500 }
      );
    }

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username !== adminUsername ||
      password !== adminPassword
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password." },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(sessionSecret);

    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin")
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 2 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to process login request." },
      { status: 400 }
    );
  }
}
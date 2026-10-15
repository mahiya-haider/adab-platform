
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required." },
        { status: 400 }
      );
    }

    if (name.length > 100 || email.length > 254) {
      return NextResponse.json(
        { success: false, message: "Input is too long." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 12 characters and no more than 72 UTF-8 bytes.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email }).select("_id");

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      passwordHash,
      membershipStatus: "inactive",
      membershipExpiresAt: null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your account has been created. You can now sign in.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Reader signup failed.");

    return NextResponse.json(
      { success: false, message: "Unable to create account right now." },
      { status: 500 }
    );
  }
}

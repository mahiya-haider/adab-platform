import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyAdminToken } from "@/lib/admin-auth";
import Poet from "@/models/Poet";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return false;

  try {
    await verifyAdminToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    await connectDB();

    const poets = await Poet.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      poets,
    });
  } catch (error) {
    console.error("Fetch poets error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch poets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Admin authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Poet name is required" },
        { status: 400 }
      );
    }

    const stringFields = [
      "penName",
      "biography",
      "profileImage",
      "type",
      "language",
    ];

    for (const field of stringFields) {
      if (
        body[field] !== undefined &&
        typeof body[field] !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid ${field} value`,
          },
          { status: 400 }
        );
      }
    }

    const poet = await Poet.create({
      name: body.name.trim(),
      penName: body.penName?.trim() ?? "",
      biography: body.biography?.trim() ?? "",
      profileImage: body.profileImage?.trim() ?? "",
      type: body.type?.trim() || "poet",
      language: body.language?.trim() || "Urdu",
    });

    return NextResponse.json(
      { success: true, poet },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create poet error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create poet" },
      { status: 500 }
    );
  }
}
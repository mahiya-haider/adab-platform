import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyAdminToken } from "@/lib/admin-auth";
import Kalaam from "@/models/Kalaam";

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

    const kalaam = await Kalaam.find()
      .populate("poet", "name penName")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, kalaam });
  } catch (error) {
    console.error("Fetch kalaam error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch kalaam" },
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
      typeof body.content !== "string" ||
      !body.content.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Kalaam content is required" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "ghazal",
      "naat",
      "manqabat",
      "sher",
      "bait",
      "qitaa",
      "other",
    ];

    const type = body.type ?? "other";

    if (
      typeof type !== "string" ||
      !allowedTypes.includes(type)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid kalaam type" },
        { status: 400 }
      );
    }

    for (const field of ["title", "poet", "language"]) {
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

    const item = await Kalaam.create({
      title: body.title?.trim() ?? "",
      content: body.content.trim(),
      type,
      poetName: body.poet?.trim() ?? "",
      language: body.language?.trim() || "Urdu",
    });

    return NextResponse.json(
      { success: true, kalaam: item },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create kalaam error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create kalaam" },
      { status: 500 }
    );
  }
}
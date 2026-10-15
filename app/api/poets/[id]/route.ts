import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { verifyAdminToken } from "@/lib/admin-auth";
import Poet from "@/models/Poet";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Admin authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid poet ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "name",
      "penName",
      "biography",
      "profileImage",
      "type",
      "language",
    ];

    const updates: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid ${field} value`,
            },
            { status: 400 }
          );
        }

        updates[field] = body[field].trim();
      }
    }

    if (
      updates.name !== undefined &&
      !updates.name
    ) {
      return NextResponse.json(
        { success: false, message: "Poet name is required" },
        { status: 400 }
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    await connectDB();

    const poet = await Poet.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!poet) {
      return NextResponse.json(
        { success: false, message: "Poet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Poet updated successfully",
      poet,
    });
  } catch (error) {
    console.error("Update poet error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update poet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Admin authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid poet ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const poet = await Poet.findByIdAndDelete(id);

    if (!poet) {
      return NextResponse.json(
        { success: false, message: "Poet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Poet deleted successfully",
    });
  } catch (error) {
    console.error("Delete poet error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete poet" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { verifyAdminToken } from "@/lib/admin-auth";
import Kalaam from "@/models/Kalaam";

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
        { success: false, message: "Invalid kalaam ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "title",
      "content",
      "type",
      "poet",
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

        const value = body[field].trim();

        if (field === "poet") {
          updates.poetName = value;
        } else {
          updates[field] = value;
        }
      }
    }

    if (
      updates.content !== undefined &&
      !updates.content
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Kalaam content is required",
        },
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

    if (
      updates.type !== undefined &&
      !allowedTypes.includes(updates.type)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid kalaam type" },
        { status: 400 }
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 }
      );
    }

    await connectDB();

    const item = await Kalaam.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Kalaam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kalaam updated successfully",
      kalaam: item,
    });
  } catch (error) {
    console.error("Update kalaam error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update kalaam" },
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
        { success: false, message: "Invalid kalaam ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const item = await Kalaam.findByIdAndDelete(id);

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Kalaam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kalaam deleted successfully",
    });
  } catch (error) {
    console.error("Delete kalaam error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete kalaam" },
      { status: 500 }
    );
  }
}
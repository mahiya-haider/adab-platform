import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/Book";
import { verifyAdminToken } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedLanguages = ["English", "Hindi", "Urdu", "Roman Urdu"];

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  return verifyAdminToken(token);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Admin login required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if ("title" in body) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { success: false, message: "Book title is required." },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    for (const field of ["author", "description", "coverImage"] as const) {
      if (field in body) {
        if (typeof body[field] !== "string") {
          return NextResponse.json(
            { success: false, message: `Invalid ${field} value.` },
            { status: 400 }
          );
        }
        updates[field] = body[field].trim();
      }
    }

    if ("language" in body) {
      if (
        typeof body.language !== "string" ||
        !allowedLanguages.includes(body.language)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid book language." },
          { status: 400 }
        );
      }
      updates.language = body.language;
    }

    if ("content" in body) {
      if (typeof body.content !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid book content." },
          { status: 400 }
        );
      }
      updates.content = body.content;
    }

    if ("chapters" in body) {
      if (
        !Array.isArray(body.chapters) ||
        body.chapters.some(
          (chapter: unknown) =>
            !chapter ||
            typeof chapter !== "object" ||
            typeof (chapter as { title?: unknown }).title !== "string" ||
            typeof (chapter as { content?: unknown }).content !== "string"
        )
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid chapter data." },
          { status: 400 }
        );
      }

      updates.chapters = body.chapters.map(
        (
          chapter: { title: string; content: string; order?: number },
          index: number
        ) => ({
          title: chapter.title.trim(),
          content: chapter.content,
          order:
            typeof chapter.order === "number" ? chapter.order : index + 1,
        })
      );
    }

    if ("readingDirection" in body) {
      if (!["ltr", "rtl"].includes(body.readingDirection)) {
        return NextResponse.json(
          { success: false, message: "Invalid reading direction." },
          { status: 400 }
        );
      }
      updates.readingDirection = body.readingDirection;
    }

    if ("isPublished" in body) {
      if (typeof body.isPublished !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Invalid publication status." },
          { status: 400 }
        );
      }
      updates.isPublished = body.isPublished;
    }

    if ("accessType" in body) {
      if (!["free", "membership"].includes(body.accessType)) {
        return NextResponse.json(
          { success: false, message: "Invalid book access type." },
          { status: 400 }
        );
      }
      updates.accessType = body.accessType;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update." },
        { status: 400 }
      );
    }

    await connectDB();

    const book = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return NextResponse.json(
        { success: false, message: "Book not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, book });
  } catch (error) {
    console.error("Update book error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update book." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Admin login required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return NextResponse.json(
        { success: false, message: "Book not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("Delete book error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete book." },
      { status: 500 }
    );
  }
}
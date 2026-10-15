import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyAdminToken } from "@/lib/admin-auth";
import Article from "@/models/Article";

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

    const articles = await Article.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, articles });
  } catch (error) {
    console.error("Fetch articles error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch articles" },
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
      typeof body.title !== "string" ||
      !body.title.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Article title is required" },
        { status: 400 }
      );
    }

    if (
      typeof body.content !== "string" ||
      !body.content.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Article content is required" },
        { status: 400 }
      );
    }

    const optionalFields = [
      "summary",
      "author",
      "coverImage",
      "language",
    ];

    for (const field of optionalFields) {
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

    const article = await Article.create({
      title: body.title.trim(),
      content: body.content.trim(),
      summary: body.summary?.trim() ?? "",
      author: body.author?.trim() ?? "",
      coverImage: body.coverImage?.trim() ?? "",
      language: body.language?.trim() || "Urdu",
    });

    return NextResponse.json(
      { success: true, article },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create article error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create article" },
      { status: 500 }
    );
  }
}
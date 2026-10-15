
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/Book";
import { verifyAdminToken } from "@/lib/admin-auth";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    const admin = await verifyAdminToken(token);

    const filter = admin ? {} : { isPublished: true };

    // Public book listings return metadata only.
    // Full book content and chapters are not included here.
    
const bookFields = admin
  ? "title author description coverImage language readingDirection isPublished accessType content chapters createdAt"
  : "title author description coverImage language readingDirection isPublished accessType createdAt";

const books = await Book.find(filter)
  .select(bookFields)
  .sort({ createdAt: -1 })
  .lean();


    return NextResponse.json({
      success: true,
      books,
    });
  } catch (error) {
    console.error("Fetch books error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch books.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!(await verifyAdminToken(token))) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin login required.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Book title is required.",
        },
        { status: 400 }
      );
    }

    const allowedLanguages = [
      "English",
      "Hindi",
      "Urdu",
      "Roman Urdu",
    ];

    const language = allowedLanguages.includes(body.language)
      ? body.language
      : "Urdu";

    const chapters = Array.isArray(body.chapters)
      ? body.chapters
          .filter(
            (chapter: unknown) =>
              chapter !== null &&
              typeof chapter === "object" &&
              typeof (chapter as { title?: unknown }).title ===
                "string" &&
              (chapter as { title: string }).title.trim() &&
              typeof (chapter as { content?: unknown }).content ===
                "string"
          )
          .map(
            (
              chapter: {
                title: string;
                content: string;
                order?: number;
              },
              index: number
            ) => ({
              title: chapter.title.trim(),
              content: chapter.content,
              order:
                typeof chapter.order === "number"
                  ? chapter.order
                  : index + 1,
            })
          )
      : [];

    const readingDirection =
      body.readingDirection === "ltr" ||
      body.readingDirection === "rtl"
        ? body.readingDirection
        : language === "Urdu" || language === "Roman Urdu"
          ? "rtl"
          : "ltr";

    const accessType =
      body.accessType === "membership" ? "membership" : "free";

    await connectDB();

    const book = await Book.create({
      title: body.title.trim(),
      author:
        typeof body.author === "string" ? body.author.trim() : "",
      description:
        typeof body.description === "string"
          ? body.description.trim()
          : "",
      coverImage:
        typeof body.coverImage === "string"
          ? body.coverImage.trim()
          : "",
      language,
      content:
        typeof body.content === "string" ? body.content : "",
      chapters,
      readingDirection,
      isPublished: body.isPublished === true,
      accessType,
    });

    return NextResponse.json(
      { success: true, book },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create book error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create book.",
      },
      { status: 500 }
    );
  }
}

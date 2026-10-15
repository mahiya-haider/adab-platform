import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Suggestion from "@/models/Suggestion";
import Book from "@/models/Book";
import { verifyAdminToken } from "@/lib/admin-auth";

type RouteContext = {
params: Promise<{ id: string }>;
};

export async function PATCH(
request: Request,
context: RouteContext
) {
try {
const cookieStore = await cookies();
const token = cookieStore.get("admin_session")?.value;

if (!(await verifyAdminToken(token))) {
  return NextResponse.json(
    {
      success: false,
      message: "Unauthorized. Admin login required.",
    },
    { status: 401 }
  );
}

const { id } = await context.params;

if (!mongoose.isValidObjectId(id)) {
  return NextResponse.json(
    { success: false, message: "Invalid suggestion ID." },
    { status: 400 }
  );
}

const body: unknown = await request.json();

if (!body || typeof body !== "object" || Array.isArray(body)) {
  return NextResponse.json(
    { success: false, message: "Invalid request body." },
    { status: 400 }
  );
}

const status = (body as Record<string, unknown>).status;

if (status !== "approved" && status !== "rejected") {
  return NextResponse.json(
    {
      success: false,
      message: "Status must be approved or rejected.",
    },
    { status: 400 }
  );
}

await connectDB();

const suggestion = await Suggestion.findById(id);

if (!suggestion) {
  return NextResponse.json(
    { success: false, message: "Suggestion not found." },
    { status: 404 }
  );
}

if (status === "approved") {
  await Book.updateOne(
    { suggestionId: suggestion._id },
    {
      $setOnInsert: {
        title: suggestion.bookTitle,
        author: suggestion.authorName || "",
        description: suggestion.reason || "",
        coverImage: "",
        language: "Urdu",
        suggestionId: suggestion._id,
      },
    },
    { upsert: true, runValidators: true }
  );
}

suggestion.status = status;
await suggestion.save();

return NextResponse.json({
  success: true,
  message:
    status === "approved"
      ? "Suggestion approved and book added to the library."
      : "Suggestion rejected. Any previously published book remains in the library.",
  suggestion,
});

} catch (error) {
console.error("Update suggestion error:", error);

return NextResponse.json(
  {
    success: false,
    message: "Failed to update suggestion. Please try again.",
  },
  { status: 500 }
);

}
}
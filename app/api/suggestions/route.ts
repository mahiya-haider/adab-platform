import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import Suggestion from "@/models/Suggestion";
import { verifyAdminToken } from "@/lib/admin-auth";

function cleanText(value: unknown, maxLength: number): string {
if (typeof value !== "string") return "";
return value.trim().slice(0, maxLength);
}

export async function GET() {
try {
const cookieStore = await cookies();
const token = cookieStore.get("admin_session")?.value;

if (!(await verifyAdminToken(token))) {
  return NextResponse.json(
    { success: false, message: "Unauthorized. Admin login required." },
    { status: 401 }
  );
}

await connectDB();

const suggestions = await Suggestion.find()
  .sort({ createdAt: -1 })
  .lean();

return NextResponse.json({ success: true, suggestions });

} catch (error) {
console.error("Fetch suggestions error:", error);

return NextResponse.json(
  { success: false, message: "Failed to fetch suggestions." },
  { status: 500 }
);

}
}

export async function POST(request: Request) {
try {
const body: unknown = await request.json();

if (!body || typeof body !== "object" || Array.isArray(body)) {
  return NextResponse.json(
    { success: false, message: "Invalid request body." },
    { status: 400 }
  );
}

const input = body as Record<string, unknown>;
const bookTitle = cleanText(input.bookTitle, 200);

if (!bookTitle) {
  return NextResponse.json(
    { success: false, message: "Book title is required." },
    { status: 400 }
  );
}

const authorName = cleanText(input.authorName, 150);
const reason = cleanText(input.reason, 2000);
const suggestedBy = cleanText(input.suggestedBy, 100);

await connectDB();

const suggestion = await Suggestion.create({
  bookTitle,
  authorName,
  reason,
  suggestedBy,
  status: "pending",
});

return NextResponse.json(
  {
    success: true,
    message: "Thank you for your contribution. Your book suggestion has been submitted successfully.",
    suggestion,
  },
  { status: 201 }
);

} catch (error) {
console.error("Create suggestion error:", error);

return NextResponse.json(
  { success: false, message: "Failed to create suggestion." },
  { status: 500 }
);

}
}
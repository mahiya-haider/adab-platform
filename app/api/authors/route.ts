import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyAdminToken } from "@/lib/admin-auth";
import Author from "@/models/Author";

export async function GET() {
try {
await connectDB();

const authors = await Author.find().sort({ createdAt: -1 });

return NextResponse.json({ success: true, authors });

} catch (error) {
console.error("Fetch authors error:", error);

return NextResponse.json(
  { success: false, message: "Failed to fetch authors" },
  { status: 500 }
);

}
}

export async function POST(request: Request) {
try {
const cookieStore = await cookies();
const token = cookieStore.get("admin_session")?.value;

if (!token || !(await verifyAdminToken(token))) {
  return NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 }
  );
}

const body = await request.json();

if (typeof body.name !== "string" || !body.name.trim()) {
  return NextResponse.json(
    { success: false, message: "Author name is required" },
    { status: 400 }
  );
}

await connectDB();

const author = await Author.create({
  name: body.name.trim(),
  penName:
    typeof body.penName === "string" ? body.penName.trim() : "",
  biography:
    typeof body.biography === "string" ? body.biography.trim() : "",
  profileImage:
    typeof body.profileImage === "string"
      ? body.profileImage.trim()
      : "",
  language:
    typeof body.language === "string" && body.language.trim()
      ? body.language.trim()
      : "Urdu",
});

return NextResponse.json(
  { success: true, author },
  { status: 201 }
);

} catch (error) {
console.error("Create author error:", error);

return NextResponse.json(
  { success: false, message: "Failed to create author" },
  { status: 500 }
);

}
}
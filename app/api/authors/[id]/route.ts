import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { verifyAdminToken } from "@/lib/admin-auth";
import Author from "@/models/Author";

async function isAdmin() {
const cookieStore = await cookies();
const token = cookieStore.get("admin_session")?.value;

return !!token && (await verifyAdminToken(token));
}

type RouteContext = {
params: Promise<{ id: string }>;
};

export async function PATCH(
request: Request,
{ params }: RouteContext
) {
try {
if (!(await isAdmin())) {
return NextResponse.json(
{ success: false, message: "Unauthorized" },
{ status: 401 }
);
}

const { id } = await params;

if (!mongoose.isValidObjectId(id)) {
  return NextResponse.json(
    { success: false, message: "Invalid author ID" },
    { status: 400 }
  );
}

const body = await request.json();
const allowedFields = [
  "name",
  "penName",
  "biography",
  "profileImage",
  "language",
] as const;

const updateData: Record<string, string> = {};

for (const field of allowedFields) {
  if (field in body) {
    if (typeof body[field] !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid value for ${field}`,
        },
        { status: 400 }
      );
    }

    updateData[field] = body[field].trim();
  }
}

if ("name" in updateData && !updateData.name) {
  return NextResponse.json(
    { success: false, message: "Author name is required" },
    { status: 400 }
  );
}

await connectDB();

const author = await Author.findByIdAndUpdate(
  id,
  { $set: updateData },
  { new: true, runValidators: true }
);

if (!author) {
  return NextResponse.json(
    { success: false, message: "Author not found" },
    { status: 404 }
  );
}

return NextResponse.json({ success: true, author });

} catch (error) {
console.error("Update author error:", error);

return NextResponse.json(
  { success: false, message: "Failed to update author" },
  { status: 500 }
);

}
}

export async function DELETE(
request: Request,
{ params }: RouteContext
) {
try {
if (!(await isAdmin())) {
return NextResponse.json(
{ success: false, message: "Unauthorized" },
{ status: 401 }
);
}

const { id } = await params;

if (!mongoose.isValidObjectId(id)) {
  return NextResponse.json(
    { success: false, message: "Invalid author ID" },
    { status: 400 }
  );
}

await connectDB();

const author = await Author.findByIdAndDelete(id);

if (!author) {
  return NextResponse.json(
    { success: false, message: "Author not found" },
    { status: 404 }
  );
}

return NextResponse.json({
  success: true,
  message: "Author deleted successfully",
});

} catch (error) {
console.error("Delete author error:", error);

return NextResponse.json(
  { success: false, message: "Failed to delete author" },
  { status: 500 }
);

}
}
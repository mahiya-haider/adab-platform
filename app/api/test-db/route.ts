import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      success: true,
      message: "MongoDB connected successfully!",
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
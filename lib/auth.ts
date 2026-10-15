
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getReaderSession(): Promise<{
  userId: string;
} | null> {
  try {
    const sessionSecret = process.env.USER_SESSION_SECRET;

    if (!sessionSecret || sessionSecret.length < 32) {
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("reader_session")?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(sessionSecret);

    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      payload.role !== "reader" ||
      typeof payload.sub !== "string" ||
      !payload.sub
    ) {
      return null;
    }

    return { userId: payload.sub };
  } catch {
    return null;
  }
}

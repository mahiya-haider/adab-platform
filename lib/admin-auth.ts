import { jwtVerify } from "jose";

export async function verifyAdminToken(token?: string) {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!token || !sessionSecret) {
    return false;
  }

  try {
    const secret = new TextEncoder().encode(sessionSecret);

    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    return payload.sub === "admin" && payload.role === "admin";
  } catch {
    return false;
  }
}
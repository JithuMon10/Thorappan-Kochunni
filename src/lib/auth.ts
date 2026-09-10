import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { UserRole } from "@/types";

export const COOKIE_NAME = "thorappan_session";
const JWT_SECRET_STRING =
  process.env.AUTH_SECRET ||
  "thorappankochunni_default_development_secret_key_ensure_min_32_chars";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export async function createSessionToken(role: UserRole): Promise<string> {
  return await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<{ role: UserRole } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (payload.role && ["viewer", "uploader", "admin"].includes(payload.role as string)) {
      return { role: payload.role as UserRole };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = await verifySessionToken(token);
  return verified ? verified.role : null;
}

export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hash);
}

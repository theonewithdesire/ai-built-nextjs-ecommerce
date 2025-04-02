import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import db from "./db";
import { UserRow } from "./types";
import { JWT_SECRET, ADMIN_PHONE } from "./env"; // Use env.ts

const SECRET = JWT_SECRET;
const ADMIN_PHONE_ENV = ADMIN_PHONE;

/**
 * Hash a password using bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyAdmin(phone: string, password: string): Promise<boolean> {
  if (!ADMIN_PHONE_ENV) throw new Error("ADMIN_PHONE not set");
  const admin = db.prepare("SELECT password FROM users WHERE is_admin = 1 AND email = 'admin@example.com'").get() as UserRow;
  if (!admin) throw new Error("Admin not found in DB");
  return phone === ADMIN_PHONE_ENV && await bcrypt.compare(password, admin.password);
}

export function generateAccessToken(userId: number, isAdmin: boolean): string {
  if (!SECRET) throw new Error("JWT_SECRET not set");
  return jwt.sign({ userId, isAdmin }, SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: number, isAdmin?: boolean): string {
  if (!SECRET) throw new Error("JWT_SECRET not set");
  return jwt.sign({ userId, isAdmin }, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: number; isAdmin?: boolean } | null {
  if (!SECRET) throw new Error("JWT_SECRET not set");
  try {
    return jwt.verify(token, SECRET) as { userId: number; isAdmin?: boolean };
  } catch {
    return null;
  }
}

export function setRefreshCookie(res: NextResponse, refreshToken: string) {
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

export function getRefreshCookie(req: Request): string | undefined {
  const cookie = req.headers.get("cookie")?.split("; ").find(row => row.startsWith("refreshToken="));
  return cookie?.split("=")[1];
}
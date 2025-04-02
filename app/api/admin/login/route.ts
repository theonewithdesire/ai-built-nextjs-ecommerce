import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyAdmin, generateAccessToken, generateRefreshToken } from "@/lib/auth";
import { UserRow } from "@/lib/types";

// Specify Node.js runtime
export const runtime = 'nodejs';

export const POST = async (req: Request) => {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password are required" }, { status: 400 });
    }
    if (!(await verifyAdmin(phone, password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const admin = db.prepare("SELECT id FROM users WHERE is_admin = 1 LIMIT 1").get() as UserRow;
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 500 });
    }
    
    // Generate tokens - make sure isAdmin is included in the refresh token
    const accessToken = generateAccessToken(admin.id, true);
    const refreshToken = generateRefreshToken(admin.id, true); // Include isAdmin flag
    
    // Create response with access token and success message
    const response = NextResponse.json({ 
      success: true,
      accessToken,
      refreshToken // Send the refresh token in the response for client storage
    });
    
    // Set refresh token cookie with safer settings
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: false, // Allow client-side access for debugging
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax' // Better compatibility with modern browsers
    });
    
    console.log("Login successful, setting refresh token cookie");
    
    return response;
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
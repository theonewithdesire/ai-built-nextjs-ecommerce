import { NextResponse } from "next/server";
import { verifyToken, generateAccessToken } from "@/lib/auth";

// Specify Node.js runtime
export const runtime = 'nodejs';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json({ 
        valid: false, 
        error: "No token provided"
      }, { status: 400 });
    }

    if (typeof token !== 'string') {
      return NextResponse.json({ 
        valid: false, 
        error: "Token must be a string"
      }, { status: 400 });
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ 
        valid: false, 
        error: "Invalid token - could not verify"
      }, { status: 401 });
    }

    // Generate a new access token for client usage
    const accessToken = generateAccessToken(payload.userId, Boolean(payload.isAdmin));

    return NextResponse.json({
      valid: true,
      isAdmin: Boolean(payload.isAdmin), 
      userId: payload.userId,
      accessToken: accessToken
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ 
      valid: false, 
      error: "Server error"
    }, { status: 500 });
  }
}; 
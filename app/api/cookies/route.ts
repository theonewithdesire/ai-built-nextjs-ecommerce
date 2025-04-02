import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { CookieRow } from "@/lib/types";

export async function GET() {
  try {
    // Query all cookies from the database
    const cookies = db.prepare(`
      SELECT * FROM cookies
    `).all() as CookieRow[];
    
    // Ensure cookies is an array before mapping
    const cookiesArray = Array.isArray(cookies) ? cookies : [];
    
    // Parse JSON-stored data
    const formattedCookies = cookiesArray.map(cookie => ({
      ...cookie,
      nutrition: JSON.parse(cookie.nutrition || '{}'),
      allergens: JSON.parse(cookie.allergens || '[]'),
      top_reviews: JSON.parse(cookie.top_reviews || '[]')
    }));

    return NextResponse.json({ cookies: formattedCookies });
  } catch (error) {
    console.error("Error fetching cookies:", error);
    return NextResponse.json(
      { error: "Failed to fetch cookies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    
    if (!payload || !payload.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await request.json();
    const { 
      name, 
      description, 
      bg_color, 
      image, 
      stock,
      nutrition,
      allergens,
      top_reviews 
    } = data;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Cookie name is required" },
        { status: 400 }
      );
    }

    // Insert cookie into database
    const result = db.prepare(`
      INSERT INTO cookies (
        name, 
        description, 
        bg_color, 
        image, 
        stock, 
        nutrition, 
        allergens, 
        top_reviews
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      description || "",
      bg_color || "#FFDC9C",
      image || "",
      stock || 0,
      JSON.stringify(nutrition || {}),
      JSON.stringify(allergens || []),
      JSON.stringify(top_reviews || [])
    );

    return NextResponse.json({ 
      success: true, 
      message: "Cookie added successfully", 
      cookieId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error("Error adding cookie:", error);
    return NextResponse.json(
      { error: "Failed to add cookie" },
      { status: 500 }
    );
  }
}

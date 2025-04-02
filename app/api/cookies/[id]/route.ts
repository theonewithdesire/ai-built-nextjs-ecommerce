import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { CookieRow } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Query specific cookie from the database
    const cookie = db.prepare(`
      SELECT * FROM cookies WHERE id = ?
    `).get(id) as CookieRow | undefined;

    if (!cookie) {
      return NextResponse.json(
        { error: "Cookie not found" },
        { status: 404 }
      );
    }

    // Parse JSON-stored data
    const formattedCookie = {
      ...cookie,
      nutrition: JSON.parse(cookie.nutrition || '{}'),
      allergens: JSON.parse(cookie.allergens || '[]'),
      top_reviews: JSON.parse(cookie.top_reviews || '[]')
    };

    return NextResponse.json({ cookie: formattedCookie });
  } catch (error) {
    console.error("Error fetching cookie:", error);
    return NextResponse.json(
      { error: "Failed to fetch cookie" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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

    // Check if cookie exists
    const existingCookie = db.prepare(`
      SELECT id FROM cookies WHERE id = ?
    `).get(id);

    if (!existingCookie) {
      return NextResponse.json(
        { error: "Cookie not found" },
        { status: 404 }
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

    // Update cookie in database
    db.prepare(`
      UPDATE cookies SET
        name = ?,
        description = ?,
        bg_color = ?,
        image = ?,
        stock = ?,
        nutrition = ?,
        allergens = ?,
        top_reviews = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name,
      description || "",
      bg_color || "#f5e050",
      image || "",
      stock || 0,
      JSON.stringify(nutrition || {}),
      JSON.stringify(allergens || []),
      JSON.stringify(top_reviews || []),
      id
    );

    return NextResponse.json({ 
      success: true, 
      message: "Cookie updated successfully" 
    });
  } catch (error) {
    console.error("Error updating cookie:", error);
    return NextResponse.json(
      { error: "Failed to update cookie" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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

    // Check if cookie exists
    const existingCookie = db.prepare(`
      SELECT id FROM cookies WHERE id = ?
    `).get(id);

    if (!existingCookie) {
      return NextResponse.json(
        { error: "Cookie not found" },
        { status: 404 }
      );
    }

    // Delete cookie from database
    db.prepare(`
      DELETE FROM cookies WHERE id = ?
    `).run(id);

    return NextResponse.json({ 
      success: true, 
      message: "Cookie deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting cookie:", error);
    return NextResponse.json(
      { error: "Failed to delete cookie" },
      { status: 500 }
    );
  }
} 
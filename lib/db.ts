import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { ADMIN_PASSWORD } from "./env"; // Use env.ts

// Only enable verbose logging in development and when explicitly requested
const isVerbose = process.env.NODE_ENV === 'development' && process.env.DB_VERBOSE === 'true';
const db = new Database("cookie-shop.db", { verbose: isVerbose ? console.log : undefined });

// Cookies Table
db.exec(`
  CREATE TABLE IF NOT EXISTS cookies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    bg_color TEXT,
    image TEXT,
    rating REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    nutrition TEXT,
    allergens TEXT,
    top_reviews TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Package Options Table
db.exec(`
  CREATE TABLE IF NOT EXISTS package_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    size TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    save_percentage REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Users Table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    saved_addresses TEXT,
    last_purchases TEXT,
    gender TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Orders Table
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cookie_id INTEGER NOT NULL,
    package_option_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    delivery_time TEXT NOT NULL,
    order_time TEXT DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cookie_id) REFERENCES cookies(id),
    FOREIGN KEY (package_option_id) REFERENCES package_options(id)
  );
`);

// Seed Data
async function seedDatabase() {
  // Check if cookies table already has data before inserting
  const existingCookies = db.prepare('SELECT COUNT(*) as count FROM cookies').get() as { count: number };
  if (existingCookies.count === 0) {
    // Only insert if no cookies exist to avoid duplicates
    db.prepare(`
      INSERT INTO cookies (
        name, description, bg_color, image, stock, nutrition, allergens, top_reviews
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Chocolate Chip",
      "Classic chocolate chip cookie with a crisp edge and chewy center",
      "#f5e050",
      "/images/cookies/chocolate-chip.jpg",
      25,
      JSON.stringify({
        calories: 250,
        protein: 3,
        fat: 12,
        carbs: 36
      }),
      JSON.stringify(["Gluten", "Dairy", "Eggs"]),
      JSON.stringify([
        "Best cookie I've ever had!",
        "Perfect chocolate-to-cookie ratio",
        "My kids absolutely love these"
      ])
    );

    db.prepare(`
      INSERT INTO cookies (
        name, description, bg_color, image, stock, nutrition, allergens, top_reviews
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Oatmeal Raisin",
      "Chewy oatmeal cookie loaded with plump raisins and a hint of cinnamon",
      "#e8c39e",
      "/images/cookies/oatmeal-raisin.jpg",
      18,
      JSON.stringify({
        calories: 220,
        protein: 4,
        fat: 9,
        carbs: 32
      }),
      JSON.stringify(["Gluten", "Dairy"]),
      JSON.stringify([
        "Reminds me of my grandmother's recipe",
        "Not too sweet, perfectly balanced",
        "Great with afternoon tea"
      ])
    );
  }

  // Check if package options exist before inserting
  const existingPackages = db.prepare('SELECT COUNT(*) as count FROM package_options').get() as { count: number };
  if (existingPackages.count === 0) {
    db.prepare(`
      INSERT INTO package_options (type, size, price, image, save_percentage)
      VALUES (?, ?, ?, ?, ?)
    `).run("Standard", "Small (6 cookies)", 9.99, "/images/packages/small.jpg", 0);
    
    db.prepare(`
      INSERT INTO package_options (type, size, price, image, save_percentage)
      VALUES (?, ?, ?, ?, ?)
    `).run("Family", "Medium (12 cookies)", 18.99, "/images/packages/medium.jpg", 5);
    
    db.prepare(`
      INSERT INTO package_options (type, size, price, image, save_percentage)
      VALUES (?, ?, ?, ?, ?)
    `).run("Party", "Large (24 cookies)", 34.99, "/images/packages/large.jpg", 12);
  }

  // Check if admin user exists before inserting
  const existingAdmin = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1').get() as { count: number };
  if (existingAdmin.count === 0) {
    const adminPassword = ADMIN_PASSWORD || "amir1382";
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    db.prepare(`
      INSERT INTO users (first_name, last_name, email, password, is_admin)
      VALUES (?, ?, ?, ?, ?)
    `).run("Amir", "Admin", "admin@example.com", hashedPassword, 1);
  }
}

// Add this function to reset database for clean testing
export async function resetDatabase() {
  // Delete all cookies except the initial seed data
  db.prepare('DELETE FROM cookies WHERE id > 2').run();
}

seedDatabase().catch(err => console.error("Seed failed:", err));

export default db;
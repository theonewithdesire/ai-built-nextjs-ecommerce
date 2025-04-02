export interface UserRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  password: string;
  saved_addresses: string | null;
  last_purchases: string | null;
  gender: string | null;
  is_admin: number;
  created_at: string;
}

export interface CookieRow {
  id: number;
  name: string;
  description: string | null;
  bg_color: string | null;
  image: string | null;
  rating: number;
  rating_count: number;
  stock: number;
  nutrition: string | null; // JSON string
  allergens: string | null; // JSON string
  top_reviews: string | null; // JSON string
  created_at: string;
  updated_at: string;
}
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import pool from "./db";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function createToken(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token.value);
  
  if (!payload || !payload.userId) {
    return null;
  }

  // ALWAYS return the authenticated user, not the viewing artist
  // Get user info with photo from artist_profiles
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, ap.photo_url 
     FROM users u
     LEFT JOIN artist_profiles ap ON u.id = ap.user_id
     WHERE u.id = $1`,
    [payload.userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    photo_url: user.photo_url || null,
  };
}

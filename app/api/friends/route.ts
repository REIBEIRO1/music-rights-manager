import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all friendships where user is involved, including profile photos
    const result = await pool.query(
      `SELECT 
        f.id,
        f.requester_id as user_id,
        f.receiver_id as friend_id,
        f.status,
        f.created_at,
        CASE 
          WHEN f.requester_id = $1 THEN u2.name
          ELSE u1.name
        END as name,
        CASE 
          WHEN f.requester_id = $1 THEN u2.email
          ELSE u1.email
        END as email,
        CASE 
          WHEN f.requester_id = $1 THEN u2.role
          ELSE u1.role
        END as role,
        CASE 
          WHEN f.requester_id = $1 THEN ap2.photo_url
          ELSE ap1.photo_url
        END as photo_url
      FROM friendships f
      JOIN users u1 ON f.requester_id = u1.id
      JOIN users u2 ON f.receiver_id = u2.id
      LEFT JOIN artist_profiles ap1 ON u1.id = ap1.user_id
      LEFT JOIN artist_profiles ap2 ON u2.id = ap2.user_id
      WHERE f.requester_id = $1 OR f.receiver_id = $1
      ORDER BY f.created_at DESC`,
      [session.id]
    );

    return NextResponse.json({ 
      friends: result.rows,
      currentUserId: parseInt(session.id as string)
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

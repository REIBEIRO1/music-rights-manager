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

    // Get team members where current user is the artist, including profile photos
    const result = await pool.query(
      `SELECT 
        tm.id,
        tm.member_id,
        tm.role,
        tm.permissions,
        u.name,
        u.email,
        ap.photo_url
      FROM team_members tm
      JOIN users u ON tm.member_id = u.id
      LEFT JOIN artist_profiles ap ON u.id = ap.user_id
      WHERE tm.artist_id = $1
      ORDER BY tm.created_at DESC`,
      [session.id]
    );

    return NextResponse.json({ 
      members: result.rows
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

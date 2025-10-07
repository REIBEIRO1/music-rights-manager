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

    // Get artists where current user is a team member (manager)
    const result = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        tm.permissions
      FROM team_members tm
      JOIN users u ON tm.artist_id = u.id
      WHERE tm.member_id = $1
      ORDER BY u.name ASC`,
      [session.id]
    );

    return NextResponse.json({ 
      artists: result.rows
    });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json(
      { error: "Failed to fetch artists" },
      { status: 500 }
    );
  }
}

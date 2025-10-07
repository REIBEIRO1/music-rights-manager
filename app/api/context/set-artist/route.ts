import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { artistId } = await request.json();

    if (!artistId) {
      return NextResponse.json(
        { error: "Artist ID is required" },
        { status: 400 }
      );
    }

    // Verify that the manager has access to this artist
    const result = await pool.query(
      "SELECT * FROM team_members WHERE artist_id = $1 AND member_id = $2",
      [artistId, session.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "You don't have access to this artist" },
        { status: 403 }
      );
    }

    // Set the viewing context cookie
    const cookieStore = await cookies();
    cookieStore.set("viewing-artist-id", artistId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ 
      success: true,
      artistId 
    });
  } catch (error) {
    console.error("Error setting artist context:", error);
    return NextResponse.json(
      { error: "Failed to set artist context" },
      { status: 500 }
    );
  }
}

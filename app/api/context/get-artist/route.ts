import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const viewingArtistId = cookieStore.get("viewing-artist-id")?.value;

    if (!viewingArtistId) {
      return NextResponse.json({ artist: null });
    }

    // Get artist details
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [viewingArtistId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ artist: null });
    }

    return NextResponse.json({ 
      artist: result.rows[0]
    });
  } catch (error) {
    console.error("Error getting artist context:", error);
    return NextResponse.json(
      { error: "Failed to get artist context" },
      { status: 500 }
    );
  }
}

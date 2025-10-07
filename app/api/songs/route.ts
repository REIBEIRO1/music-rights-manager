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

    const result = await pool.query(
      `SELECT * FROM songs WHERE owner_id = $1 ORDER BY created_at DESC`,
      [session.id]
    );

    return NextResponse.json({ songs: result.rows });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      isrc,
      iswc,
      upc,
      genre,
      subgenre,
      duration,
      creation_date,
      release_date,
      status,
      lyrics,
    } = body;

    const result = await pool.query(
      `INSERT INTO songs (
        owner_id, title, isrc, iswc, upc, genre, subgenre,
        duration, creation_date, release_date, status, lyrics
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        session.id,
        title,
        isrc,
        iswc,
        upc,
        genre,
        subgenre,
        duration,
        creation_date,
        release_date,
        status || 'demo',
        lyrics,
      ]
    );

    return NextResponse.json({ song: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating song:", error);
    return NextResponse.json(
      { error: "Failed to create song" },
      { status: 500 }
    );
  }
}

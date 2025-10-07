import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM songs WHERE id = $1 AND owner_id = $2`,
      [params.id, session.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ song: result.rows[0] });
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json(
      { error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      `UPDATE songs SET
        title = $1,
        isrc = $2,
        iswc = $3,
        upc = $4,
        genre = $5,
        subgenre = $6,
        duration = $7,
        creation_date = $8,
        release_date = $9,
        status = $10,
        lyrics = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND owner_id = $13
      RETURNING *`,
      [
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
        params.id,
        session.id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ song: result.rows[0] });
  } catch (error) {
    console.error("Error updating song:", error);
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `DELETE FROM songs WHERE id = $1 AND owner_id = $2 RETURNING id`,
      [params.id, session.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}

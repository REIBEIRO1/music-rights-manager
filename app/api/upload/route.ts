import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/db";

// Increase body size limit for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `profile-${session.id}-${timestamp}.${extension}`;
    const filepath = join(process.cwd(), "public", "uploads", "profiles", filename);

    // Save file
    await writeFile(filepath, buffer);

    // Update photo_url in database
    const photoUrl = `/uploads/profiles/${filename}`;
    
    // Check if profile exists
    const existingProfile = await pool.query(
      "SELECT id FROM artist_profiles WHERE user_id = $1",
      [session.id]
    );

    if (existingProfile.rows.length > 0) {
      await pool.query(
        "UPDATE artist_profiles SET photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
        [photoUrl, session.id]
      );
    } else {
      await pool.query(
        "INSERT INTO artist_profiles (user_id, photo_url) VALUES ($1, $2)",
        [session.id, photoUrl]
      );
    }

    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

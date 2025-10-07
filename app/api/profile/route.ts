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

    // Get user basic info
    const userResult = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [session.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Get artist profile if exists
    const profileResult = await pool.query(
      "SELECT * FROM artist_profiles WHERE user_id = $1",
      [session.id]
    );

    const profile = profileResult.rows.length > 0 
      ? {
          ...profileResult.rows[0],
          email: user.email, // Include user email
          id_card_expiry: profileResult.rows[0].id_card_expiry 
            ? new Date(profileResult.rows[0].id_card_expiry).toISOString().split('T')[0] 
            : "",
          birthday: profileResult.rows[0].birthday 
            ? new Date(profileResult.rows[0].birthday).toISOString().split('T')[0] 
            : "",
        }
      : {
          email: user.email,
          artist_name: user.name,
        };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
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

    const data = await request.json();

    // Check if profile exists
    const existingProfile = await pool.query(
      "SELECT id FROM artist_profiles WHERE user_id = $1",
      [session.id]
    );

    if (existingProfile.rows.length > 0) {
      // Update existing profile
      await pool.query(
        `UPDATE artist_profiles SET
          artist_name = $1,
          real_name = $2,
          age = $3,
          spa_member_number = $4,
          spa_coop_number = $5,
          ipi_number = $6,
          alias_ipi_number = $7,
          label = $8,
          distributor = $9,
          email_alt = $10,
          phone_number = $11,
          spotify_artist_id = $12,
          id_card_number = $13,
          nif = $14,
          id_card_expiry = $15,
          address = $16,
          postal_code = $17,
          birthday = $18,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $19`,
        [
          data.artist_name || null,
          data.real_name || null,
          data.age ? parseInt(data.age) : null,
          data.spa_member_number || null,
          data.spa_coop_number || null,
          data.ipi_number || null,
          data.alias_ipi_number || null,
          data.label || null,
          data.distributor || null,
          data.email_alt || null,
          data.phone_number || null,
          data.spotify_artist_id || null,
          data.id_card_number || null,
          data.nif || null,
          data.id_card_expiry || null,
          data.address || null,
          data.postal_code || null,
          data.birthday || null,
          session.id,
        ]
      );
    } else {
      // Insert new profile
      await pool.query(
        `INSERT INTO artist_profiles (
          user_id, artist_name, real_name, age, spa_member_number, spa_coop_number,
          ipi_number, alias_ipi_number, label, distributor, email_alt, phone_number,
          spotify_artist_id, id_card_number, nif, id_card_expiry, address, postal_code, birthday
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          session.id,
          data.artist_name || null,
          data.real_name || null,
          data.age ? parseInt(data.age) : null,
          data.spa_member_number || null,
          data.spa_coop_number || null,
          data.ipi_number || null,
          data.alias_ipi_number || null,
          data.label || null,
          data.distributor || null,
          data.email_alt || null,
          data.phone_number || null,
          data.spotify_artist_id || null,
          data.id_card_number || null,
          data.nif || null,
          data.id_card_expiry || null,
          data.address || null,
          data.postal_code || null,
          data.birthday || null,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

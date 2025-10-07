import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
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

    const { memberId, permissions } = await request.json();

    if (!memberId || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Check if member is already in team
    const existing = await pool.query(
      "SELECT * FROM team_members WHERE artist_id = $1 AND member_id = $2",
      [session.id, memberId]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Este utilizador já está na tua equipa" },
        { status: 400 }
      );
    }

    // Add team member with role "manager" - convert permissions array to JSON
    const result = await pool.query(
      `INSERT INTO team_members (artist_id, member_id, role, permissions)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [session.id, memberId, "manager", JSON.stringify(permissions)]
    );

    // Create notification for the manager
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'team_added', 'Adicionado à equipa', 
               'Foste adicionado como manager de um artista', '/artists')`,
      [memberId]
    );

    return NextResponse.json({ 
      message: "Manager adicionado com sucesso",
      member: result.rows[0]
    });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar manager" },
      { status: 500 }
    );
  }
}

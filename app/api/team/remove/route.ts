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

    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Remove team member
    await pool.query(
      "DELETE FROM team_members WHERE artist_id = $1 AND member_id = $2",
      [session.id, memberId]
    );

    return NextResponse.json({ 
      message: "Manager removido com sucesso"
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Erro ao remover manager" },
      { status: 500 }
    );
  }
}

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

    const { friendshipId, action } = await request.json();

    if (!friendshipId || !action) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Verify the friendship request is for this user
    const friendshipResult = await pool.query(
      "SELECT * FROM friendships WHERE id = $1 AND receiver_id = $2 AND status = 'pending'",
      [friendshipId, session.id]
    );

    if (friendshipResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Pedido de amizade não encontrado" },
        { status: 404 }
      );
    }

    const friendship = friendshipResult.rows[0];

    if (action === "accept") {
      // Accept the friendship
      await pool.query(
        "UPDATE friendships SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [friendshipId]
      );

      // Create notification for the requester
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, 'friend_accepted', 'Pedido aceite', 
                 'O teu pedido de amizade foi aceite', '/friends')`,
        [friendship.requester_id]
      );

      return NextResponse.json({ 
        message: "Pedido de amizade aceite"
      });
    } else if (action === "reject") {
      // Delete the friendship request
      await pool.query(
        "DELETE FROM friendships WHERE id = $1",
        [friendshipId]
      );

      return NextResponse.json({ 
        message: "Pedido de amizade rejeitado"
      });
    } else {
      return NextResponse.json(
        { error: "Ação inválida" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error responding to friend request:", error);
    return NextResponse.json(
      { error: "Erro ao responder ao pedido" },
      { status: 500 }
    );
  }
}

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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Find user by email
    const userResult = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    const friendId = userResult.rows[0].id;

    // Check if trying to add themselves
    if (friendId === parseInt(session.id as string)) {
      return NextResponse.json(
        { error: "Não podes adicionar-te a ti próprio" },
        { status: 400 }
      );
    }

    // Check if friendship already exists
    const existingFriendship = await pool.query(
      `SELECT * FROM friendships 
       WHERE (requester_id = $1 AND receiver_id = $2) 
       OR (requester_id = $2 AND receiver_id = $1)`,
      [session.id, friendId]
    );

    if (existingFriendship.rows.length > 0) {
      const status = existingFriendship.rows[0].status;
      if (status === "accepted") {
        return NextResponse.json(
          { error: "Já são amigos" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Pedido de amizade já existe" },
          { status: 400 }
        );
      }
    }

    // Create friendship request
    const result = await pool.query(
      `INSERT INTO friendships (requester_id, receiver_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [session.id, friendId]
    );

    // Create notification for the friend
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'friend_request', 'Novo pedido de amizade', 
               'Tens um novo pedido de amizade', '/friends')`,
      [friendId]
    );

    return NextResponse.json({ 
      message: "Pedido de amizade enviado",
      friendship: result.rows[0]
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Erro ao enviar pedido de amizade" },
      { status: 500 }
    );
  }
}

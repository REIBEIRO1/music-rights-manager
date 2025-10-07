import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("viewing-artist-id");

    return NextResponse.json({ 
      success: true
    });
  } catch (error) {
    console.error("Error clearing artist context:", error);
    return NextResponse.json(
      { error: "Failed to clear artist context" },
      { status: 500 }
    );
  }
}

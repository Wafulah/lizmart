import prisma from "@/lib/prisma";
import type { NextRequest } from 'next/server';
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = id;

    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message:
        newRole === "ADMIN"
          ? "User promoted to admin"
          : "Admin rights revoked",
    });
  } catch (error) {
    console.error("Error toggling user role:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle user role" },
      { status: 500 }
    );
  }
}

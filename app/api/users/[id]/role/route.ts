import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const userId = params.id;
  const data = await request.json();

  if (!data.role || !Object.values(Role).includes(data.role)) {
    return NextResponse.json(
      { error: "Invalid role provided" },
      { status: 400 },
    );
  }

  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
  });

  if (!session || !user || user.role !== "SUPERADMIN") {
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: data.role as Role,
      },
    });

    return NextResponse.json(
      { success: true, msg: "User role updated" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: "Failed to update user role" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role === "USER") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const userId = params.id;
  const { balance } = await request.json();

  try {
    const updatedCredits = await prisma.credits.upsert({
      where: { userId: userId },
      update: { balance: balance },
      create: { userId: userId, balance: balance },
    });

    return NextResponse.json(updatedCredits);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update credits" },
      { status: 500 },
    );
  }
}

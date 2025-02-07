import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const transactionId = params.id;

  if (!transactionId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 403 });
  }

  if (user.role === "USER") {
    return NextResponse.json(
      { error: "You are not authorized to delete this task" },
      { status: 403 },
    );
  }

  try {
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
}

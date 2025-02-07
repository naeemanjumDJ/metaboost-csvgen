import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const skip = (page - 1) * limit;

  try {
    const transactions = await prisma.transaction.findMany({
      skip,
      take: limit,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.transaction.count();
    const pageCount = Math.ceil(total / limit);

    return NextResponse.json({ transactions, pageCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const data = await request.json();

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

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Create the transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          currency: data.currency,
          status: "COMPLETED", // Assuming the transaction is completed immediately
          paymentMethod: data.paymentMethod,
          creditAmount: data.creditAmount,
        },
      });

      // Update user credits
      const updatedCredits = await prisma.credits.upsert({
        where: { userId: data.userId },
        update: { balance: { increment: data.creditAmount } },
        create: { userId: data.userId, balance: data.creditAmount },
      });

      // Create credit transaction
      const creditTransaction = await prisma.creditTransaction.create({
        data: {
          userId: data.userId,
          amount: data.creditAmount,
          type: "PURCHASE",
          transactionId: transaction.id,
        },
      });

      return { transaction, updatedCredits, creditTransaction };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}

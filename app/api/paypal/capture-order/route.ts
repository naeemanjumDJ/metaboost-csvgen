import { auth } from "@/auth";
import { getPaypalAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, msg: "Unauthorized" },
        { status: 401 },
      );
    }
    const { orderID, transactionId } = await req.json();

    const accessToken = await getPaypalAccessToken();

    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PayPal API error:", errorData);
      throw new Error("Failed to capture PayPal order");
    }

    const captureData = await response.json();
    console.log("PayPal order captured:", captureData);

    const updatedTransaction = await prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      });

      const creditTransaction = await prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          amount: transaction.creditAmount,
          type: "PURCHASE",
          transactionId: transaction.id,
        },
      });

      const updatedCredits = await prisma.credits.upsert({
        where: { userId: session.user.id },
        update: { balance: { increment: transaction.creditAmount } },
        create: { userId: session.user.id, balance: transaction.creditAmount },
      });

      return { transaction, creditTransaction, updatedCredits };
    });

    return NextResponse.json({ captureData, updatedTransaction });
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return NextResponse.json(
      { success: false, msg: "Something went wrong" },
      { status: 500 },
    );
  }
}

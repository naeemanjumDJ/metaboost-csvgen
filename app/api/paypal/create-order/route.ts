import { auth } from "@/auth";
import { getPaypalAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";
import prisma from "@/lib/prisma";
import { calculateCreditPrice } from "@/lib/utils";
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
    const { credits } = await req.json();

    const { price, discount } = calculateCreditPrice(credits);
    console.log(
      `Creating order for ${credits} credits at $${price} (${discount} discount)`,
    );
    const accessToken = await getPaypalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price.toString(),
            },
            description: `${credits} credits for $${price} (${discount} discount)`,
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
              brand_name: "MetaBoost",
              locale: "en-US",
              landing_page: "LOGIN",
              shipping_preference: "NO_SHIPPING",
              user_action: "PAY_NOW",
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("PayPal API error:", errorData);
      throw new Error("Failed to create PayPal order");
    }
    const order = await response.json();
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: price,
        currency: "USD",
        status: "PENDING",
        paymentMethod: "PAYPAL",
        creditAmount: credits,
        paypalOrderId: order.id,
      },
    });
    return NextResponse.json(
      { success: true, transactionId: transaction.id, orderId: order.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      {
        success: false,
        msg: "Failed to create order",
      },
      { status: 500 },
    );
  }
}

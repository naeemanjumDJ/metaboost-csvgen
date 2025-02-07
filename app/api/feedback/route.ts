import { auth } from "@/auth";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeedbackType } from "@prisma/client";

interface Body {
  title: string;
  description?: string;
  type: FeedbackType[];
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as Body;
    const {  title, description, type } = data;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          msg: `Unauthorized`,
        },
        {
          status: 401,
        },
      );
    }
    try {
      await prisma.feedback.create({
        data: {
          title,
          description,
          types: type,
          userId: session.user.id,
        },
      });

      return NextResponse.json(
        {
          success: true,
          msg: "Thank you for your feedback!",
        },
        { status: 201 },
      );
    } catch (error) {
      console.error("Error creating adding feedback:", error);
      return NextResponse.json(
        {
          success: false,
          msg: "An error occurred while adding feedback.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      {
        success: false,
        msg: "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}

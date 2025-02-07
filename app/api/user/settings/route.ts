import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { checkApiKeyValidity } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json(
      { success: false, msg: "Unauthorized" },
      { status: 401 },
    );
  }

  const { openAiApiKey, geminiApiKey, preferredApi, useAiVision } =
    await req.json();

  // Validate API keys if provided
  if (openAiApiKey) {
    const openAiCheck = await checkApiKeyValidity("OPENAI", openAiApiKey);
    console.log("openAiCheck", openAiCheck);
    if (!openAiCheck.success) {
      return NextResponse.json(
        { success: false, msg: `OpenAi key error: ${openAiCheck.msg}` },
        { status: 400 },
      );
    }
  }

  if (geminiApiKey) {
    const geminiCheck = await checkApiKeyValidity("GEMINI", geminiApiKey);
    if (!geminiCheck.success) {
      return NextResponse.json(
        { success: false, msg: `Gemini key error: ${geminiCheck.msg}` },
        { status: 400 },
      );
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        openAiApiKey: openAiApiKey ? openAiApiKey : null,
        geminiApiKey: geminiApiKey ? geminiApiKey : null,
        preferredApi: preferredApi || geminiApiKey ? "GEMINI" : "OPENAI",
        useAiVision,
      },
    });

    return NextResponse.json(
      { success: true, msg: "Settings saved successfully", user: updatedUser },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { success: false, msg: "Something went wrond" },
      { status: 500 },
    );
  }
}

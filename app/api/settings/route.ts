import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // const settings = await prisma.settings.findMany();
    // const settingsObject = settings.reduce(
    //   (acc, setting) => {
    //     acc[setting.key] = setting.value;
    //     return acc;
    //   },
    //   {} as Record<string, string>,
    // );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const data = await request.json();

  try {
    //   const updatedSettings = await prisma.$transaction(
    //     Object.entries(data).map(([key, value]) =>
    //       prisma.settings.upsert({
    //         where: { key },
    //         update: { value: value as string },
    //         create: { key, value: value as string },
    //       }),
    //     ),
    //   );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: "Failed to update settings" },
      { status: 500 },
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const fileName = searchParams.get("fileName");
  const contentType = searchParams.get("contentType");

  if (!process.env.AWS_S3_BUCKET_NAME) {
    return NextResponse.json(
      {
        success: false,
        msg: "AWS S3 bucket name not found in environment variables",
      },
      { status: 500 },
    );
  }

  if (!fileName || !contentType) {
    return NextResponse.json(
      {
        success: false,
        msg: "fileName and contentType are required query parameters",
      },
      { status: 400 },
    );
  }

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({ success: true, signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { success: false, msg: "Failed to generate signed URL" },
      { status: 500 },
    );
  }
}

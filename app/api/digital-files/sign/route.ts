import { NextRequest, NextResponse } from "next/server";
import {
  listDigitalFiles,
  parseContext,
  cloudinary,
} from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { title, fileName, fileSize, fileType } = await req.json();

    if (!title || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ext = fileName.toLowerCase().match(/\.\w+$/)?.[0] ?? "";
    if (![".pdf", ".pptx"].includes(ext)) {
      return NextResponse.json(
        { error: "Only PDF and PPTX files are accepted" },
        { status: 400 }
      );
    }

    if (fileSize && fileSize > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Check for existing file with same title and delete it
    try {
      const existing = await listDigitalFiles();
      const duplicate = existing.find((r) => {
        const ctx = parseContext(r.context);
        return (ctx.title || "").toLowerCase() === title.toLowerCase();
      });
      if (duplicate) {
        await cloudinary.uploader.destroy(duplicate.public_id, {
          resource_type: "raw",
        });
      }
    } catch (err) {
      console.error("Failed to check duplicates:", err);
    }

    const publicId = `digitalfile_${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "";
    const context = `title=${title}|file_type=${fileType || ext.slice(1)}`;

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        public_id: publicId,
        resource_type: "raw",
        context,
      },
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({
      signature,
      timestamp,
      publicId,
      context,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    console.error("Digital file sign error:", err);
    const message = err instanceof Error ? err.message : "Failed to prepare upload";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

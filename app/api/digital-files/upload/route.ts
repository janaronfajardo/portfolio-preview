import { NextRequest, NextResponse } from "next/server";
import {
  uploadDigitalFile,
  listDigitalFiles,
  parseContext,
  cloudinary,
} from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ext = file.name.toLowerCase().match(/\.\w+$/)?.[0] ?? "";
    if (![".pdf", ".pptx"].includes(ext)) {
      return NextResponse.json(
        { error: "Only PDF and PPTX files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
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

    const bytes = await file.arrayBuffer();
    const result = await uploadDigitalFile(
      Buffer.from(bytes),
      file.name,
      title
    );

    return NextResponse.json({
      success: true,
      id: result.public_id,
      url: result.secure_url,
    });
  } catch (err) {
    console.error("Digital file upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

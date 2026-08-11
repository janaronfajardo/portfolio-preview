import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { publicId, title, fileType } = await req.json();

    if (!publicId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await cloudinary.api.update(publicId, {
      resource_type: "raw",
      context: `title=${title}|file_type=${fileType || "pdf"}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update context error:", err);
    const message = err instanceof Error ? err.message : "Failed to update context";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

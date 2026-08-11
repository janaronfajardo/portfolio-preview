import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { publicId, title, fileType, resourceType } = await req.json();

    if (!publicId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rType = resourceType || "raw";
    try {
      await cloudinary.api.update(publicId, {
        resource_type: rType,
        context: `title=${title}|file_type=${fileType || "pdf"}`,
      });
    } catch {
      const fallback = rType === "raw" ? "image" : "raw";
      await cloudinary.api.update(publicId, {
        resource_type: fallback,
        context: `title=${title}|file_type=${fileType || "pdf"}`,
      });
    }

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

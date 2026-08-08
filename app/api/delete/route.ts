import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Missing publicId" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });

    if (result.result === "ok") {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to delete document" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

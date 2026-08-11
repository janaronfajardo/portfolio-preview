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
    const contextStr = `title=${title}|file_type=${fileType || "pdf"}`;
    console.log("Updating context for", publicId, "resource_type:", rType, "context:", contextStr);

    let updated = false;
    for (const rt of [rType, rType === "raw" ? "image" : "raw"]) {
      try {
        const result = await cloudinary.api.update(publicId, {
          resource_type: rt,
          context: contextStr,
        });
        console.log("Context update result:", JSON.stringify(result.context));
        updated = true;
        break;
      } catch (err) {
        console.error(`Context update failed with resource_type=${rt}:`, err);
      }
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update context" },
        { status: 500 }
      );
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

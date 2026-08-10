import { NextResponse } from "next/server";
import { listDigitalFiles, parseContext } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const resources = await listDigitalFiles();

    const files = resources
      .map((r) => {
        const ctx = parseContext(r.context);
        return {
          id: r.public_id,
          title: ctx.title || "Untitled",
          fileType: ctx.file_type || "pdf",
          date: r.created_at.split("T")[0],
          fileUrl: r.secure_url,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json({ files });
  } catch (err) {
    console.error("Failed to list digital files:", err);
    return NextResponse.json(
      { files: [], error: "Failed to load files" },
      { status: 200 }
    );
  }
}

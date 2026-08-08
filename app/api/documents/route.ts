import { NextResponse } from "next/server";
import { listDocuments, parseContext } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const resources = await listDocuments();

    const documents = resources.map((r) => {
      const ctx = parseContext(r.context);
      return {
        id: r.public_id,
        title: ctx.title || ctx.student_name || "Untitled",
        studentName: ctx.student_name || "Unknown",
        date: r.created_at.split("T")[0],
        fileUrl: r.secure_url,
        thumbnail: "/thumbnails/placeholder.svg",
        tags: r.tags || [],
        description: "",
      };
    });

    return NextResponse.json({ documents });
  } catch (err) {
    console.error("Failed to list documents:", err);
    return NextResponse.json(
      { documents: [], error: "Failed to load documents" },
      { status: 200 }
    );
  }
}

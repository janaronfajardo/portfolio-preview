import { NextResponse } from "next/server";
import { listDocuments } from "@/lib/cloudinary";

export async function GET() {
  try {
    const resources = await listDocuments();

    const documents = resources.map((r) => ({
      id: r.public_id,
      title: r.context?.custom?.title || r.context?.custom?.student_name || "Untitled",
      studentName: r.context?.custom?.student_name || "Unknown",
      date: r.created_at.split("T")[0],
      fileUrl: r.secure_url,
      thumbnail: "/thumbnails/placeholder.svg",
      tags: r.tags || [],
      description: "",
    }));

    return NextResponse.json({ documents });
  } catch (err) {
    console.error("Failed to list documents:", err);
    return NextResponse.json(
      { documents: [], error: "Failed to load documents" },
      { status: 200 }
    );
  }
}

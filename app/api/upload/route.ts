import { NextRequest, NextResponse } from "next/server";
import { uploadDocument, listDocuments, parseContext, cloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const studentName = formData.get("studentName") as string;

    if (!file || !studentName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ext = file.name.toLowerCase().match(/\.\w+$/)?.[0] ?? "";
    if (![".pdf", ".docx"].includes(ext)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Check for existing document with same student name and delete it
    try {
      const existing = await listDocuments();
      const duplicate = existing.find((r) => {
        const ctx = parseContext(r.context);
        return (ctx.student_name || "").toLowerCase() === studentName.toLowerCase();
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
    const result = await uploadDocument(
      Buffer.from(bytes),
      file.name,
      studentName
    );

    return NextResponse.json({
      success: true,
      id: result.public_id,
      url: result.secure_url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

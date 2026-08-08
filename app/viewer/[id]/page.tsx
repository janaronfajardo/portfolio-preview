import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { listDocuments, getDocument, parseContext, type CloudinaryResource } from "@/lib/cloudinary";
import type { Assignment } from "@/lib/data";
import { DocumentViewer } from "@/components/DocumentViewer";

export const dynamic = "force-dynamic";

function resourceToAssignment(r: CloudinaryResource): Assignment {
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
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const r = await getDocument(params.id);
    const a = resourceToAssignment(r);
    return {
      title: `${a.title} — Showcase`,
      description: a.description,
    };
  } catch {
    return { title: "Not Found — Showcase" };
  }
}

export default async function ViewerPage({ params }: { params: { id: string } }) {
  let assignment: Assignment;
  let allAssignments: Assignment[] = [];

  try {
    const r = await getDocument(params.id);
    assignment = resourceToAssignment(r);
    const resources = await listDocuments();
    allAssignments = resources.map(resourceToAssignment);
  } catch {
    notFound();
  }

  const currentIndex = allAssignments.findIndex((a) => a.id === params.id);
  const prevAssignment = currentIndex > 0 ? allAssignments[currentIndex - 1] : null;
  const nextAssignment = currentIndex >= 0 && currentIndex < allAssignments.length - 1 ? allAssignments[currentIndex + 1] : null;

  return (
    <div className="mx-auto max-w-5xl px-[clamp(1rem,5vw,3rem)] py-4 md:py-8">
      <Link
        href="/gallery"
        className="group inline-flex items-center gap-1 font-mono text-sm font-bold uppercase brutal-btn bg-paper dark:bg-ink px-4 py-2 mb-4 md:mb-6"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Gallery
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h1 className="font-mono font-black text-fluid-xl mb-3 uppercase">
            {assignment.title}
          </h1>
          {assignment.description && (
            <p className="font-mono text-black/60 dark:text-white/60 text-fluid-base leading-relaxed">
              {assignment.description}
            </p>
          )}
        </div>

        <div className="brutal-card bg-yellow text-black p-4 flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2 font-mono font-bold">
            <User className="h-4 w-4" />
            {assignment.studentName}
          </div>
          <div className="flex items-center gap-2 font-mono font-bold">
            <Calendar className="h-4 w-4" />
            {new Date(assignment.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          {assignment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {assignment.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-1 brutal-tag bg-paper dark:bg-ink"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="brutal-card overflow-hidden bg-paper dark:bg-ink">
        <DocumentViewer
          fileUrl={assignment.fileUrl}
          title={assignment.title}
          studentName={assignment.studentName}
        />
      </div>

      <div className="flex items-center justify-between mt-8 gap-4">
        {prevAssignment ? (
          <Link
            href={`/viewer/${prevAssignment.id}`}
            className="group flex items-center gap-2 max-w-[45%] brutal-btn bg-paper dark:bg-ink text-black dark:text-white px-4 py-3"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
            <div className="min-w-0">
              <p className="font-mono text-xs text-black/40 dark:text-white/40 uppercase">Previous</p>
              <p className="font-mono text-sm font-bold truncate group-hover:text-accent transition-colors uppercase">
                {prevAssignment.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextAssignment ? (
          <Link
            href={`/viewer/${nextAssignment.id}`}
            className="group flex items-center gap-2 max-w-[45%] text-right flex-row-reverse brutal-btn bg-paper dark:bg-ink text-black dark:text-white px-4 py-3"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 rotate-180 transition-transform group-hover:translate-x-1" />
            <div className="min-w-0">
              <p className="font-mono text-xs text-black/40 dark:text-white/40 uppercase">Next</p>
              <p className="font-mono text-sm font-bold truncate group-hover:text-accent transition-colors uppercase">
                {nextAssignment.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

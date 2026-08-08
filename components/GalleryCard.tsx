"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FileText, ArrowUpRight, Trash2, AlertCircle } from "lucide-react";
import type { Assignment } from "@/lib/data";
import { cn } from "@/lib/utils";

const tagColors = ["bg-cyan text-black", "bg-accent text-black", "bg-lime text-black", "bg-pink text-black", "bg-yellow text-black"];

export function GalleryCard({ assignment, index, onDelete }: { assignment: Assignment; index: number; onDelete?: (id: string) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    if (window.innerWidth < 1024) return;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: assignment.id }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <Link href={`/viewer/${assignment.id}`} className="group block">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="brutal-card bg-paper dark:bg-ink-light overflow-hidden"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <div className="aspect-[4/5] relative overflow-hidden bg-paper-dark dark:bg-ink-light brutal-border border-b-[3px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={assignment.thumbnail}
              alt={assignment.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 brutal-tag font-mono text-xs font-bold uppercase bg-accent text-black">
              <FileText className="h-3 w-3" />
              Document
            </span>
          </div>

          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleDelete}
              className="w-9 h-9 brutal-border bg-pink text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="w-9 h-9 brutal-border bg-paper dark:bg-ink-light text-black dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="font-mono font-bold text-base leading-tight mb-1 group-hover:text-accent transition-colors uppercase text-black dark:text-white">
            {assignment.title}
          </h3>
          <p className="font-mono text-sm text-black/60 dark:text-white/60 mb-3">
            {assignment.studentName}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {assignment.tags.slice(0, 3).map((tag, i) => (
              <span
                key={tag}
                className={cn(
                  "font-mono text-[0.7rem] px-2 py-0.5 brutal-tag font-bold",
                  tagColors[i % tagColors.length]
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="brutal-card bg-paper dark:bg-ink p-6 max-w-sm w-full rotate-neg-1deg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 brutal-border bg-pink text-black flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-mono font-black text-base uppercase text-black dark:text-white mb-1">
                  Delete Document?
                </h3>
                <p className="font-mono text-sm text-black/60 dark:text-white/60">
                  This will permanently delete <span className="font-bold">{assignment.title}</span> from the gallery. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 brutal-btn bg-paper dark:bg-ink text-black dark:text-white font-mono text-sm font-bold uppercase hover:bg-paper-dark dark:hover:bg-ink-light"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 brutal-btn bg-pink text-black font-mono text-sm font-bold uppercase hover:bg-accent disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import { FileText, ArrowUpRight } from "lucide-react";
import type { Assignment } from "@/lib/data";
import { cn } from "@/lib/utils";

const tagColors = ["bg-cyan text-ink", "bg-accent text-ink", "bg-lime text-ink", "bg-pink text-ink", "bg-yellow text-ink"];

export function GalleryCard({ assignment, index }: { assignment: Assignment; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    if (window.innerWidth < 1024) return;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
  };

  return (
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 brutal-tag font-mono text-xs font-bold uppercase bg-accent text-ink">
              <FileText className="h-3 w-3" />
              Document
            </span>
          </div>

          <div className="absolute top-3 right-3 w-9 h-9 brutal-border bg-paper dark:bg-ink-light text-ink dark:text-paper flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="font-mono font-bold text-base leading-tight mb-1 group-hover:text-accent transition-colors uppercase text-ink dark:text-paper">
            {assignment.title}
          </h3>
          <p className="font-mono text-sm text-ink/60 dark:text-paper/60 mb-3">
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
  );
}

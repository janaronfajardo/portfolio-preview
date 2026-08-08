"use client";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import type { Assignment } from "@/lib/data";
import { GalleryCard } from "@/components/GalleryCard";

export function GalleryGrid() {
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.documents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return documents.filter((a) => {
      const matchesSearch =
        search === "" ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.studentName.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    });
  }, [search, documents]);

  return (
    <div className="mx-auto max-w-7xl px-[clamp(1rem,5vw,3rem)] py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 dark:text-paper/40" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 brutal-border bg-paper dark:bg-ink text-ink dark:text-paper font-mono text-sm focus:outline-none focus:shadow-brutal-accent transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-mono font-bold text-fluid-lg text-ink/40 dark:text-paper/40 mb-2 uppercase">
            Loading...
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((assignment, index) => (
            <div key={assignment.id} className="animate-stagger" style={{ animationDelay: `${index * 60}ms` }}>
              <GalleryCard assignment={assignment} index={index} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-mono font-bold text-fluid-lg text-ink/40 dark:text-paper/40 mb-2 uppercase">
            No documents found
          </p>
          <p className="font-mono text-sm text-ink/40 dark:text-paper/40">
            Try adjusting your search
          </p>
        </div>
      )}
    </div>
  );
}

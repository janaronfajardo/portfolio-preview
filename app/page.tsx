import { Hero } from "@/components/Hero";
import { ShowcaseLetters } from "@/components/ShowcaseLetters";
import { listDocuments, parseContext } from "@/lib/cloudinary";
import type { Assignment } from "@/lib/data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured: Assignment[] = [];
  try {
    const resources = await listDocuments();
    featured = resources.map((r) => {
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
    }).sort((a, b) => a.title.localeCompare(b.title)).slice(0, 4);
  } catch {
    featured = [];
  }

  return (
    <>
      <Hero />

      {featured.length > 0 && (
        <section className="px-[clamp(1rem,5vw,3rem)] py-12 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between mb-8 md:mb-12">
              <div>
                <h2 className="font-mono font-black text-fluid-xl mb-2 uppercase">
                  <span className="bg-lime text-black px-2">Featured Work</span>
                </h2>
                <p className="font-mono text-black/60 dark:text-white/60 text-fluid-sm">
                  A selection of standout submissions
                </p>
              </div>
              <Link
                href="/gallery"
                className="group hidden sm:flex items-center gap-1 font-mono text-sm font-bold uppercase brutal-btn bg-paper dark:bg-ink text-black dark:text-white px-4 py-2"
              >
                View all
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((a) => (
                <Link
                  key={a.id}
                  href={`/viewer/${a.id}`}
                  className="group block"
                >
                  <div className="aspect-[4/5] brutal-card overflow-hidden bg-paper-dark dark:bg-ink-light mb-3 relative">
                    <img
                      src={a.thumbnail}
                      alt={a.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-mono font-bold text-base leading-tight group-hover:text-accent transition-colors uppercase text-black dark:text-white">
                    {a.title}
                  </h3>
                  <p className="font-mono text-xs text-black/50 dark:text-white/50 mt-0.5">
                    {a.studentName}
                  </p>
                </Link>
              ))}
            </div>

            <Link
              href="/gallery"
              className="group flex sm:hidden items-center justify-center gap-1 font-mono text-sm font-bold uppercase brutal-btn bg-paper dark:bg-ink text-black dark:text-white px-4 py-2 mt-6"
            >
              View all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      )}

      {featured.length === 0 && (
        <section className="px-[clamp(1rem,5vw,3rem)] py-12 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="brutal-card bg-yellow text-black p-8 md:p-12 rotate-neg-1deg">
              <h2 className="font-mono font-black text-fluid-xl mb-4 uppercase">
                No Submissions Yet
              </h2>
              <p className="font-mono text-fluid-base mb-6">
                Be the first to showcase your work. Upload your document.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-mono text-sm font-bold uppercase brutal-btn hover:bg-lime"
              >
                Upload Your Work
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="px-[clamp(1rem,5vw,3rem)] py-12 brutal-border border-t-[3px]">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <ShowcaseLetters />
          <p className="font-mono text-xs text-black/40 dark:text-white/40 uppercase">
            Diana Rose D. Areno | TTL1 Teacher
          </p>
        </div>
      </footer>
    </>
  );
}

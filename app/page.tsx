import { Hero } from "@/components/Hero";
import { ShowcaseLetters } from "@/components/ShowcaseLetters";
import { listDocuments, listDigitalFiles, parseContext } from "@/lib/cloudinary";
import type { Assignment } from "@/lib/data";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured: Assignment[] = [];
  let recentDocs: Assignment[] = [];
  let recentFiles: { id: string; title: string; date: string; fileUrl: string }[] = [];

  try {
    const resources = await listDocuments();
    const allDocs = resources.map((r) => {
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
    featured = [...allDocs].sort((a, b) => a.title.localeCompare(b.title)).slice(0, 4);
    recentDocs = [...allDocs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  } catch {
    featured = [];
    recentDocs = [];
  }

  try {
    const fileResources = await listDigitalFiles();
    recentFiles = fileResources
      .map((r) => {
        const ctx = parseContext(r.context);
        return {
          id: r.public_id,
          title: ctx.title || "Untitled",
          date: r.created_at.split("T")[0],
          fileUrl: r.secure_url,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4);
  } catch {
    recentFiles = [];
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

      {(recentDocs.length > 0 || recentFiles.length > 0) && (
        <section className="px-[clamp(1rem,5vw,3rem)] py-12 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 md:mb-12">
              <h2 className="font-mono font-black text-fluid-xl mb-2 uppercase">
                <span className="bg-cyan text-black px-2">What&apos;s New</span>
              </h2>
              <p className="font-mono text-black/60 dark:text-white/60 text-fluid-sm">
                Latest uploads across portfolio and digital files
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {recentDocs.length > 0 && (
                <div>
                  <h3 className="font-mono font-bold text-sm uppercase mb-4 text-black dark:text-white">
                    Recent Portfolio
                  </h3>
                  <div className="flex flex-col gap-3">
                    {recentDocs.map((a) => (
                      <Link
                        key={a.id}
                        href={`/viewer/${a.id}`}
                        className="group flex items-center gap-3 brutal-card bg-paper dark:bg-ink p-3 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
                      >
                        <div className="w-10 h-10 brutal-border bg-accent flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-black" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono font-bold text-sm uppercase truncate text-black dark:text-white group-hover:text-accent transition-colors">
                            {a.title}
                          </p>
                          <p className="font-mono text-xs text-black/50 dark:text-white/50 mt-0.5">
                            {a.studentName} — {new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-black/40 dark:text-white/40 group-hover:translate-x-1 transition-transform shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {recentFiles.length > 0 && (
                <div>
                  <h3 className="font-mono font-bold text-sm uppercase mb-4 text-black dark:text-white">
                    Recent Digital Files
                  </h3>
                  <div className="flex flex-col gap-3">
                    {recentFiles.map((f) => (
                      <Link
                        key={f.id}
                        href="/digital-files"
                        className="group flex items-center gap-3 brutal-card bg-paper dark:bg-ink p-3 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
                      >
                        <div className="w-10 h-10 brutal-border bg-cyan flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-black" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono font-bold text-sm uppercase truncate text-black dark:text-white group-hover:text-accent transition-colors">
                            {f.title}
                          </p>
                          <p className="font-mono text-xs text-black/50 dark:text-white/50 mt-0.5">
                            {new Date(f.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-black/40 dark:text-white/40 group-hover:translate-x-1 transition-transform shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

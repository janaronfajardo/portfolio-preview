"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Zap } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Hero() {
  const container = useRef<HTMLElement>(null);
  const [stats, setStats] = useState({ documents: 0, students: 0 });

  useEffect(() => {
    fetch("/api/documents", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const docs = data.documents || [];
        setStats({
          documents: docs.length,
          students: new Set(docs.map((d: { studentName: string }) => d.studentName)).size,
        });
      })
      .catch(() => {});
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.6 })
          .from(
            ".hero-title-line",
            { y: 100, opacity: 0, duration: 1, stagger: 0.15 },
            "-=0.3"
          )
          .from(
            ".hero-description",
            { y: 30, opacity: 0, duration: 0.8 },
            "-=0.5"
          )
          .from(
            ".hero-cta",
            { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 },
            "-=0.4"
          )
          .from(
            ".hero-stat",
            { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 },
            "-=0.3"
          );

        gsap.to(".hero-parallax", {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.from(".hero-eyebrow, .hero-title-line, .hero-description, .hero-cta, .hero-stat", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        });
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative min-h-[90vh] flex flex-col justify-center px-[clamp(1rem,5vw,3rem)] pt-12 pb-16 overflow-hidden"
    >
      <div className="hero-parallax absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-[5%] w-48 h-48 bg-lime brutal-border rotate-12 hidden md:block" />
        <div className="absolute bottom-32 left-[3%] w-32 h-32 bg-cyan brutal-border -rotate-12 hidden md:block" />
        <div className="absolute top-1/2 right-[15%] w-20 h-20 bg-pink brutal-border rotate-45 hidden lg:block" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl w-full">
        <div className="hero-eyebrow inline-flex items-center gap-2 mb-8 px-4 py-2 brutal-border bg-yellow text-ink rotate-neg-1deg">
          <Zap className="h-4 w-4" />
          <span className="font-mono text-xs font-bold uppercase tracking-wide">
            Class Assignment Showcase
          </span>
        </div>

        <h1 className="font-mono font-black text-fluid-3xl leading-[0.9] tracking-tighter mb-8 uppercase">
          <span className="hero-title-line block overflow-hidden">
            Resumes &amp;
          </span>
          <span className="hero-title-line block overflow-hidden">
            Portfolios.
          </span>
        </h1>

        <p className="hero-description max-w-lg text-fluid-base text-ink/80 dark:text-paper/80 mb-10 leading-relaxed font-mono">
          Student work, on display. Read &apos;em, zoom &apos;em, judge &apos;em.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/gallery"
            className="hero-cta group inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-ink font-mono text-sm font-bold uppercase brutal-btn hover:bg-lime"
          >
            Explore Gallery
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </Link>
          <Link
            href="/gallery?type=Portfolio"
            className="hero-cta inline-flex items-center justify-center gap-2 px-6 py-3 bg-paper dark:bg-ink font-mono text-sm font-bold uppercase brutal-btn hover:bg-cyan"
          >
            View Portfolios
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 sm:gap-6">
          <div className="hero-stat brutal-card bg-lime text-ink px-5 py-3 rotate-neg-1deg">
            <div className="font-mono font-black text-fluid-xl">
              {stats.documents}
            </div>
            <div className="font-mono text-xs uppercase font-bold mt-1">
              Documents
            </div>
          </div>
          <div className="hero-stat brutal-card bg-cyan text-ink px-5 py-3 rotate-1deg">
            <div className="font-mono font-black text-fluid-xl">
              {stats.students}
            </div>
            <div className="font-mono text-xs uppercase font-bold mt-1">
              Students
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

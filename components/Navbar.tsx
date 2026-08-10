"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ShowcaseLetters } from "@/components/ShowcaseLetters";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Portfolio" },
  { href: "/digital-files", label: "Digital Files" },
  { href: "/upload", label: "Upload" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-50 safe-top">
        <div className="brutal-border border-b-[3px] bg-paper dark:bg-ink">
          <nav className="mx-auto flex items-center justify-between px-[clamp(1rem,5vw,3rem)] py-3">
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-11 h-11 brutal-border bg-accent overflow-hidden flex items-center justify-center">
                <Image
                  src="/logov2.png"
                  alt="Logo"
                  width={44}
                  height={44}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <ShowcaseLetters className="hidden sm:flex" />
            </Link>

            <div className="hidden md:flex items-center gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide brutal-btn",
                    pathname === link.href
                      ? "bg-accent text-black"
                      : "bg-paper dark:bg-ink text-black dark:text-white hover:bg-yellow dark:hover:bg-yellow dark:hover:text-black"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 brutal-btn bg-lime text-black"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              className="md:hidden p-2 brutal-btn bg-lime text-black"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-paper dark:bg-ink safe-top pt-20 pb-8 px-6 brutal-border border-b-[3px] animate-slide-up">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 font-mono text-base font-bold uppercase brutal-btn",
                    pathname === link.href
                      ? "bg-accent text-black"
                      : "bg-paper dark:bg-ink text-black dark:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
                className="flex items-center gap-2 px-4 py-3 font-mono text-base font-bold uppercase brutal-btn bg-lime text-black text-left"
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

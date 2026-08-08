import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { NoiseOverlay, CustomCursor } from "@/components/Cursor";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Showcase — Class Assignment Gallery",
  description:
    "A gallery of student documents. Browse, zoom, and explore each document in detail.",
  openGraph: {
    title: "Showcase — Class Assignment Gallery",
    description:
      "A gallery of student documents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SmoothScroll />
          <NoiseOverlay />
          <CustomCursor />
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useSwipeable } from "react-swipeable";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type DocumentViewerProps = {
  fileUrl: string;
  title: string;
  studentName: string;
};

export function DocumentViewer({ fileUrl, title, studentName }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(Math.floor(rect.width - 32));
        setContainerHeight(Math.floor(rect.height - 32));
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = () => {
    setLoading(false);
  };

  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(numPages, p + 1));
  }, [numPages]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNextPage,
    onSwipedRight: goToPrevPage,
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

  const { ref: swipeRef, ...swipeRest } = swipeHandlers;

  const mergedRef = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    swipeRef(el);
  };

  const zoomIn = () => setScale((s) => Math.min(3, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));
  const resetZoom = () => setScale(1);

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const handleDownload = async () => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const contentType = blob.type || res.headers.get("content-type") || "";
      let ext = "pdf";
      if (contentType.includes("pdf")) ext = "pdf";
      else if (contentType.includes("word") || contentType.includes("docx")) ext = "docx";
      else if (contentType.includes("msword")) ext = "doc";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${studentName.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div ref={viewerRef} className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 brutal-border border-b-[3px] bg-paper dark:bg-ink">
        <div className="min-w-0 flex-1">
          <h2 className="font-mono font-bold text-sm sm:text-base truncate uppercase text-black dark:text-white">{title}</h2>
          <p className="font-mono text-xs text-black/50 dark:text-white/50 truncate">{studentName}</p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 brutal-btn bg-paper dark:bg-ink text-black dark:text-white disabled:opacity-30"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs font-bold w-12 text-center tabular-nums text-black dark:text-white">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-2 brutal-btn bg-paper dark:bg-ink text-black dark:text-white disabled:opacity-30"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 brutal-btn bg-paper dark:bg-ink text-black dark:text-white hidden sm:block"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 brutal-btn bg-lime text-black"
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={mergedRef}
        {...(isMobile ? swipeRest : {})}
        className="bg-paper-dark/30 dark:bg-ink-light/40 flex items-start justify-center relative brutal-border border-b-[3px] py-4 px-4"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {isMobile ? (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit
          >
              <TransformComponent
                wrapperClass="w-full"
                contentClass="flex items-start justify-center"
              >
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading=""
                  error={
                    <div className="flex flex-col items-center gap-2 p-8 text-center">
                      <p className="font-mono text-sm text-black/50 dark:text-white/50">
                        Could not load PDF. Try downloading instead.
                      </p>
                      <a
                        href={fileUrl}
                        download
                        className="font-mono text-sm font-bold uppercase text-accent"
                      >
                        Download file
                      </a>
                    </div>
                  }
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    width={containerWidth || undefined}
                    className="shadow-2xl mx-auto"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </TransformComponent>
          </TransformWrapper>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            error={
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <p className="font-mono text-sm text-black/50 dark:text-white/50">
                  Could not load PDF. Try downloading instead.
                </p>
                <a href={fileUrl} download className="font-mono text-sm font-bold uppercase text-accent">
                  Download file
                </a>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              width={containerWidth || undefined}
              className="shadow-2xl mx-auto"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>

      {numPages > 0 && (
        <div className="flex items-center justify-between px-4 py-3 brutal-border border-t-[3px] bg-paper dark:bg-ink safe-bottom">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 brutal-btn font-mono text-sm font-bold uppercase",
              currentPage <= 1
                ? "opacity-30 cursor-not-allowed bg-paper dark:bg-ink text-black dark:text-white"
                : "bg-paper dark:bg-ink text-black dark:text-white hover:bg-lime dark:hover:bg-lime dark:hover:text-black"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <span className="font-mono text-sm font-bold tabular-nums text-black dark:text-white">
            {currentPage} / {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 brutal-btn font-mono text-sm font-bold uppercase",
              currentPage >= numPages
                ? "opacity-30 cursor-not-allowed bg-paper dark:bg-ink text-black dark:text-white"
                : "bg-paper dark:bg-ink text-black dark:text-white hover:bg-lime dark:hover:bg-lime dark:hover:text-black"
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

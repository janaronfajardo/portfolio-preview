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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(Math.floor(rect.width - 32));
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

  const mergedRef = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    swipeHandlers.ref(el);
  };

  const zoomIn = () => setScale((s) => Math.min(3, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));
  const resetZoom = () => setScale(1);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-4 py-3 brutal-border border-b-[3px] bg-paper dark:bg-ink">
        <div className="min-w-0 flex-1">
          <h2 className="font-mono font-bold text-sm sm:text-base truncate uppercase text-ink dark:text-paper">{title}</h2>
          <p className="font-mono text-xs text-ink/50 dark:text-paper/50 truncate">{studentName}</p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 brutal-btn bg-paper dark:bg-ink text-ink dark:text-paper disabled:opacity-30"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs font-bold w-12 text-center tabular-nums text-ink dark:text-paper">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-2 brutal-btn bg-paper dark:bg-ink text-ink dark:text-paper disabled:opacity-30"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={resetZoom}
            className="p-2 brutal-btn bg-paper dark:bg-ink text-ink dark:text-paper hidden sm:block"
            aria-label="Reset zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <a
            href={fileUrl}
            download
            className="p-2 brutal-btn bg-lime text-ink"
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div
        ref={mergedRef}
        {...(isMobile ? { ...swipeHandlers, ref: undefined } : {})}
        className="flex-1 overflow-auto bg-paper-dark/30 dark:bg-ink-light/40 flex items-start justify-center relative brutal-border border-b-[3px] py-4 px-4"
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
                      <p className="font-mono text-sm text-ink/50 dark:text-paper/50">
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
                <p className="font-mono text-sm text-ink/50 dark:text-paper/50">
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
                ? "opacity-30 cursor-not-allowed bg-paper dark:bg-ink text-ink dark:text-paper"
                : "bg-paper dark:bg-ink text-ink dark:text-paper hover:bg-lime dark:hover:bg-lime dark:hover:text-ink"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <span className="font-mono text-sm font-bold tabular-nums text-ink dark:text-paper">
            {currentPage} / {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 brutal-btn font-mono text-sm font-bold uppercase",
              currentPage >= numPages
                ? "opacity-30 cursor-not-allowed bg-paper dark:bg-ink text-ink dark:text-paper"
                : "bg-paper dark:bg-ink text-ink dark:text-paper hover:bg-lime dark:hover:bg-lime dark:hover:text-ink"
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

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  X,
  Check,
  Loader2,
  AlertCircle,
  Download,
  Maximize2,
  Minimize2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Document, Page, pdfjs } from "react-pdf";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type DigitalFile = {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
};

const ACCEPTED_TYPES = [".pdf", ".pptx"];
const MAX_SIZE = 50 * 1024 * 1024;

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function DigitalFiles() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [files, setFiles] = useState<DigitalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<DigitalFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(() => {
    fetch("/api/digital-files", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFile = useCallback((f: File) => {
    const ext = f.name.toLowerCase().match(/\.\w+$/)?.[0] ?? "";
    if (!ACCEPTED_TYPES.includes(ext)) {
      setErrorMsg(`Only ${ACCEPTED_TYPES.join(" and ")} files are accepted.`);
      setStatus("error");
      return;
    }
    if (f.size > MAX_SIZE) {
      setErrorMsg("File too large. Maximum size is 50MB.");
      setStatus("error");
      return;
    }
    setFile(f);
    setStatus("idle");
    setErrorMsg("");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setStatus("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const res = await fetch("/api/digital-files/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(data.error || "Upload failed");
      }

      setStatus("success");
      setTitle("");
      setFile(null);
      fetchFiles();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/digital-files/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: id }),
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const handleDownload = async (fileUrl: string, fileTitle: string) => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const contentType = blob.type || "";
      let ext = "pdf";
      if (contentType.includes("pdf")) ext = "pdf";
      else if (
        contentType.includes("presentation") ||
        contentType.includes("pptx")
      )
        ext = "pptx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileTitle.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(fileUrl, "_blank");
    }
  };

  if (viewing) {
    return (
      <DigitalFileViewer
        file={viewing}
        onBack={() => {
          setViewing(null);
          fetchFiles();
        }}
        onDownload={() => handleDownload(viewing.fileUrl, viewing.title)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-[clamp(1rem,5vw,3rem)] py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-mono font-black text-fluid-2xl mb-3 uppercase">
          <span className="bg-cyan text-black px-2">Digital Files</span>
        </h1>
        <p className="font-mono text-black/60 dark:text-white/60 text-fluid-base">
          Upload and view presentations (PDF, PPTX).
        </p>
      </div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mb-12">
        {/* Title input */}
        <div>
          <label className="block font-mono text-xs font-bold uppercase mb-2 text-black dark:text-white">
            Presentation Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full px-4 py-3 brutal-border bg-paper dark:bg-ink text-black dark:text-white font-mono text-sm focus:outline-none focus:shadow-brutal-accent transition-all"
          />
        </div>

        {/* File drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "brutal-card cursor-pointer p-8 md:p-12 text-center transition-all",
            dragOver
              ? "bg-lime text-black translate-x-[-3px] translate-y-[-3px]"
              : "bg-paper dark:bg-ink-light text-black dark:text-white"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.pptx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 brutal-border bg-accent flex items-center justify-center">
                <FileText className="h-7 w-7 text-black" />
              </div>
              <div>
                <p className="font-mono font-bold text-sm uppercase">
                  {file.name}
                </p>
                <p className="font-mono text-xs text-black/60 dark:text-white/60 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setStatus("idle");
                }}
                className="flex items-center gap-1 font-mono text-xs font-bold uppercase brutal-btn bg-pink text-black px-3 py-1.5 mt-2"
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 brutal-border bg-cyan flex items-center justify-center">
                <Upload className="h-7 w-7 text-black" />
              </div>
              <div>
                <p className="font-mono font-bold text-sm uppercase">
                  Drop your file here
                </p>
                <p className="font-mono text-xs text-black/60 dark:text-white/60 mt-1">
                  or click to browse — PDF or PPTX, max 50MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status messages */}
        {status === "error" && errorMsg && (
          <div className="brutal-card bg-pink text-black p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-mono text-sm font-bold">{errorMsg}</p>
          </div>
        )}

        {status === "success" && (
          <div className="brutal-card bg-lime text-black p-4 flex items-center gap-3">
            <Check className="h-5 w-5 shrink-0" />
            <p className="font-mono text-sm font-bold">
              Upload successful! Your file is now available below.
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || !title || status === "uploading"}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-4 font-mono text-sm font-bold uppercase brutal-btn text-black",
            !file || !title || status === "uploading"
              ? "bg-paper dark:bg-ink opacity-50 cursor-not-allowed"
              : "bg-accent hover:bg-lime"
          )}
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Submit File
            </>
          )}
        </button>
      </form>

      {/* File list */}
      <div>
        <h2 className="font-mono font-black text-fluid-lg mb-6 uppercase">
          Files
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-mono font-bold text-fluid-lg text-black/40 dark:text-white/40 mb-2 uppercase">
              Loading...
            </p>
          </div>
        ) : files.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {files.map((f, index) => (
              <div
                key={f.id}
                className="brutal-card bg-paper dark:bg-ink p-4 flex flex-col gap-3 animate-stagger"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 brutal-border bg-accent flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-black" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-bold text-sm uppercase truncate text-black dark:text-white">
                      {f.title}
                    </p>
                    <p className="font-mono text-xs text-black/50 dark:text-white/50 mt-0.5">
                      {new Date(f.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setViewing(f)}
                    className="flex-1 flex items-center justify-center gap-1 font-mono text-xs font-bold uppercase brutal-btn bg-cyan text-black px-3 py-2"
                  >
                    <Maximize2 className="h-3 w-3" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(f.fileUrl, f.title)}
                    className="flex items-center justify-center gap-1 font-mono text-xs font-bold uppercase brutal-btn bg-lime text-black px-3 py-2"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${f.title}"?`)) handleDelete(f.id);
                    }}
                    className="flex items-center justify-center gap-1 font-mono text-xs font-bold uppercase brutal-btn bg-pink text-black px-3 py-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-mono font-bold text-fluid-lg text-black/40 dark:text-white/40 mb-2 uppercase">
              No files yet
            </p>
            <p className="font-mono text-sm text-black/40 dark:text-white/40">
              Upload your first presentation above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DigitalFileViewer({
  file,
  onBack,
  onDownload,
}: {
  file: DigitalFile;
  onBack: () => void;
  onDownload: () => void;
}) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const check = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(Math.floor(rect.width - 32));
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = () => {
    setLoading(false);
  };

  const zoomIn = () => setScale((s) => Math.min(3, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const fileUrlLower = file.fileUrl.toLowerCase();
  const isPdf = fileUrlLower.includes(".pdf") || fileUrlLower.includes("pdf") || !fileUrlLower.includes(".pptx");
  const isPptx = fileUrlLower.includes(".pptx") || fileUrlLower.includes("pptx");

  return (
    <div ref={viewerRef} className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between px-4 py-3 brutal-border border-b-[3px] bg-paper dark:bg-ink">
        <div className="min-w-0 flex-1">
          <h2 className="font-mono font-bold text-sm sm:text-base truncate uppercase text-black dark:text-white">
            {file.title}
          </h2>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isPdf && (
            <>
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
            </>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 brutal-btn bg-paper dark:bg-ink text-black dark:text-white"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onDownload}
            className="p-2 brutal-btn bg-lime text-black"
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-2 brutal-btn bg-pink text-black font-mono text-xs font-bold uppercase"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-paper-dark/30 dark:bg-ink-light/40 flex items-start justify-center relative brutal-border border-b-[3px] py-4 px-4"
      >
        {loading && isPdf && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {isPdf ? (
          <Document
            file={file.fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            error={
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <p className="font-mono text-sm text-black/50 dark:text-white/50">
                  Could not load file. Try downloading instead.
                </p>
                <button
                  onClick={onDownload}
                  className="font-mono text-sm font-bold uppercase text-accent"
                >
                  Download file
                </button>
              </div>
            }
          >
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
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  width={containerWidth || undefined}
                  className="shadow-2xl mx-auto"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </TransformComponent>
            </TransformWrapper>
          </Document>
        ) : isPptx ? (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.fileUrl)}`}
            className="w-full"
            style={{ minHeight: "80vh" }}
            frameBorder="0"
            title={file.title}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <FileText className="h-16 w-16 text-black/40 dark:text-white/40" />
            <p className="font-mono text-sm text-black/60 dark:text-white/60">
              Preview not available. Please download to view.
            </p>
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-mono text-sm font-bold uppercase brutal-btn hover:bg-lime"
            >
              <Download className="h-4 w-4" />
              Download File
            </button>
          </div>
        )}
      </div>

      {isPdf && numPages > 0 && (
        <div className="flex items-center justify-between px-4 py-3 brutal-border border-t-[3px] bg-paper dark:bg-ink safe-bottom">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
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

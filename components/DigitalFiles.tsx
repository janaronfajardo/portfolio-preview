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
} from "lucide-react";
import { cn } from "@/lib/utils";

type DigitalFile = {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
  fileType?: string;
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
  const [uploadProgress, setUploadProgress] = useState(0);
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
    setUploadProgress(0);

    try {
      const ext = file.name.toLowerCase().match(/\.(\w+)$/)?.[1] || "pdf";

      // Step 1: Get signed upload params from our API
      const signRes = await fetch("/api/digital-files/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          fileName: file.name,
          fileSize: file.size,
          fileType: ext,
        }),
      });

      if (!signRes.ok) {
        const data = await signRes.json().catch(() => ({ error: `Prepare failed (HTTP ${signRes.status})` }));
        throw new Error(data.error || `Prepare failed (HTTP ${signRes.status})`);
      }

      const { signature, timestamp, publicId, resourceType, cloudName, apiKey } =
        await signRes.json();

      // Step 2: Upload directly to Cloudinary with progress tracking
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const cloudForm = new FormData();
      cloudForm.append("file", file);
      cloudForm.append("api_key", apiKey);
      cloudForm.append("timestamp", String(timestamp));
      cloudForm.append("signature", signature);
      cloudForm.append("public_id", publicId);

      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error?.message || `Upload failed (HTTP ${xhr.status})`));
            } catch {
              reject(new Error(`Upload failed (HTTP ${xhr.status})`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(cloudForm);
      });

      // Step 3: Update context (title, file_type) via admin API
      setUploadProgress(100);
      await fetch("/api/digital-files/update-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, title, fileType: ext, resourceType }),
      });

      setStatus("success");
      setUploadProgress(0);
      setTitle("");
      setFile(null);
      fetchFiles();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
      setUploadProgress(0);
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

  const handleDownload = async (fileUrl: string, fileTitle: string, fileType?: string) => {
    const ext = (fileType || "pdf").toLowerCase();
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
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
        onDownload={() => handleDownload(viewing.fileUrl, viewing.title, viewing.fileType)}
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
                  or click to browse — PDF or PPTX, max 40MB PDF / 10MB PPTX
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

        {/* Progress bar */}
        {status === "uploading" && uploadProgress > 0 && (
          <div className="brutal-border bg-paper dark:bg-ink p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase text-black dark:text-white">
                Uploading...
              </span>
              <span className="font-mono text-xs font-bold tabular-nums text-black dark:text-white">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full h-3 brutal-border bg-paper-dark dark:bg-ink-light overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-200 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
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
                    onClick={() => handleDownload(f.fileUrl, f.title, f.fileType)}
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const fileType = (file.fileType || "pdf").toLowerCase();
  const isPdf = fileType === "pdf";
  const isPptx = fileType === "pptx";

  return (
    <div ref={viewerRef} className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between px-4 py-3 brutal-border border-b-[3px] bg-paper dark:bg-ink">
        <div className="min-w-0 flex-1">
          <h2 className="font-mono font-bold text-sm sm:text-base truncate uppercase text-black dark:text-white">
            {file.title}
          </h2>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.fileUrl)}&embedded=true`}
          className="w-full"
          style={{ minHeight: "85vh" }}
          frameBorder="0"
          title={file.title}
        />
      </div>
    </div>
  );
}

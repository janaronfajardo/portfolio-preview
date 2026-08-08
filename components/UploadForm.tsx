"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, Check, Loader2, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [".pdf", ".docx"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

type UploadStatus = "idle" | "uploading" | "success" | "error";

function parseNameFromFilename(filename: string): string {
  const baseName = filename.replace(/\.[^.]+$/, "");
  const parts = baseName.split("_");
  if (parts.length >= 3) {
    const lastName = parts[0];
    const firstName = parts.slice(1, -1).join(" ");
    const middleInitial = parts[parts.length - 1];
    return `${firstName} ${middleInitial}. ${lastName}`;
  }
  if (parts.length === 2) {
    return `${parts[1]} ${parts[0]}`;
  }
  return baseName.replace(/[-_]/g, " ");
}

export function UploadForm() {
  const [studentName, setStudentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const ext = f.name.toLowerCase().match(/\.\w+$/)?.[0] ?? "";
    if (!ACCEPTED_TYPES.includes(ext)) {
      setErrorMsg(`Only ${ACCEPTED_TYPES.join(" and ")} files are accepted.`);
      setStatus("error");
      return;
    }
    if (f.size > MAX_SIZE) {
      setErrorMsg("File too large. Maximum size is 10MB.");
      setStatus("error");
      return;
    }
    setFile(f);
    setStudentName(parseNameFromFilename(f.name));
    setStatus("idle");
    setErrorMsg("");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !studentName) return;

    setStatus("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("studentName", studentName);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(data.error || "Upload failed");
      }

      setStatus("success");
      setStudentName("");
      setFile(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* File drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "brutal-card cursor-pointer p-8 md:p-12 text-center transition-all",
          dragOver ? "bg-lime text-black translate-x-[-3px] translate-y-[-3px]" : "bg-paper dark:bg-ink-light text-black dark:text-white"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
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
              <p className="font-mono font-bold text-sm uppercase">{file.name}</p>
              <p className="font-mono text-xs text-black/60 dark:text-white/60 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setStudentName(""); setStatus("idle"); }}
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
                or click to browse — PDF or DOCX, max 10MB
              </p>
              <p className="font-mono text-[0.7rem] text-black/40 dark:text-white/40 mt-2">
                Filename format: Lastname_Firstname_Middleinitial
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Name preview (read-only) */}
      {file && studentName && (
        <div>
          <label className="block font-mono text-xs font-bold uppercase mb-2 text-black dark:text-white">
            Parsed Name (preview)
          </label>
          <div className="flex items-center gap-3 px-4 py-3 brutal-border bg-paper-dark dark:bg-ink text-black dark:text-white font-mono text-sm">
            <User className="h-4 w-4 shrink-0 text-black/50 dark:text-white/50" />
            <span className="font-bold uppercase">{studentName}</span>
          </div>
          <p className="font-mono text-[0.7rem] text-black/40 dark:text-white/40 mt-2">
            Auto-parsed from filename. Rename your file if this is incorrect.
          </p>
        </div>
      )}

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
            Upload successful! Your document is now in the gallery.
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!file || !studentName || status === "uploading"}
        className={cn(
          "flex items-center justify-center gap-2 px-6 py-4 font-mono text-sm font-bold uppercase brutal-btn text-black",
          !file || !studentName || status === "uploading"
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
            Submit Document
          </>
        )}
      </button>
    </form>
  );
}

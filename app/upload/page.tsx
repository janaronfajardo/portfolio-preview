import { UploadForm } from "@/components/UploadForm";

export const metadata = {
  title: "Upload — E-Portfolio",
  description: "Upload your document to the E-Portfolio.",
};

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-3xl px-[clamp(1rem,5vw,3rem)] py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-mono font-black text-fluid-2xl mb-3 uppercase">
          <span className="bg-cyan text-black px-2">Upload</span>
        </h1>
        <p className="font-mono text-black/60 dark:text-white/60 text-fluid-base">
          Drop your file — your name is parsed from the filename.
        </p>
      </div>

      <UploadForm />
    </div>
  );
}

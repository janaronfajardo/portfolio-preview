import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  format: string;
  created_at: string;
  context?: string | { custom?: Record<string, string> };
  tags: string[];
};

export function parseContext(context: CloudinaryResource["context"]): Record<string, string> {
  if (!context) return {};
  if (typeof context === "string") {
    const parsed: Record<string, string> = {};
    context.split("|").forEach((pair) => {
      const [key, ...rest] = pair.split("=");
      if (key) parsed[key.trim()] = rest.join("=").trim();
    });
    return parsed;
  }
  return context.custom || {};
}

export async function listDocuments() {
  const result = await cloudinary.api.resources({
    type: "upload",
    resource_type: "raw",
    prefix: "showcase_",
    context: true,
    tags: true,
    max_results: 100,
  });

  return result.resources as CloudinaryResource[];
}

export async function getDocument(publicId: string) {
  const result = await cloudinary.api.resource(publicId, {
    resource_type: "raw",
    context: true,
    tags: true,
  });
  return result as CloudinaryResource;
}

export async function uploadDocument(
  fileBuffer: Buffer,
  filename: string,
  studentName: string
) {
  const publicId = `showcase_${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicId,
          resource_type: "raw",
          context: `student_name=${studentName}|title=${studentName}`,
        },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      )
      .end(fileBuffer);
  });

  return result as {
    public_id: string;
    secure_url: string;
    format: string;
    created_at: string;
  };
}

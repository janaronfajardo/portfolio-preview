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
  context: {
    custom?: {
      student_name?: string;
      title?: string;
    };
  };
  tags: string[];
};

export async function listDocuments() {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: "showcase/",
    context: true,
    tags: true,
    max_results: 100,
  });

  return result.resources as CloudinaryResource[];
}

export async function getDocument(publicId: string) {
  const result = await cloudinary.api.resource(publicId, {
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
  const publicId = `showcase/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicId,
          resource_type: "raw",
          context: {
            custom: {
              student_name: studentName,
              title: studentName,
            },
          },
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

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function isS3Enabled(): boolean {
  return Boolean(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID);
}

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION ?? "auto",
    endpoint: process.env.AWS_S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: Boolean(process.env.AWS_S3_ENDPOINT),
  });
}

/**
 * Uploads a file to S3/R2 or local public/uploads/.
 * For S3: set Cache-Control to `public, max-age=31536000, immutable` on static media.
 */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (isS3Enabled()) {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return getPublicUrl(key);
  }

  const filePath = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return getPublicUrl(key);
}

export async function deleteFile(key: string): Promise<void> {
  if (isS3Enabled()) {
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      })
    );
    return;
  }

  const filePath = path.join(process.cwd(), "public", "uploads", key);
  try {
    await unlink(filePath);
  } catch {
    // arquivo pode já ter sido removido
  }
}

export function getPublicUrl(key: string): string {
  const cdn = process.env.AWS_CDN_URL?.replace(/\/$/, "");
  if (cdn) {
    return `${cdn}/${key}`;
  }

  if (isS3Enabled()) {
    const bucket = process.env.AWS_S3_BUCKET!;
    const endpoint = process.env.AWS_S3_ENDPOINT?.replace(/\/$/, "");
    if (endpoint) {
      return `${endpoint}/${bucket}/${key}`;
    }
    const region = process.env.AWS_REGION ?? "us-east-1";
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  return `/uploads/${key.replace(/\\/g, "/")}`;
}

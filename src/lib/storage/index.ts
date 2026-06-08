import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const KYC_KEY_SEGMENT = "/kyc/";
const PUBLIC_LOCAL_ROOT = path.join(process.cwd(), "public", "uploads");
const PRIVATE_LOCAL_ROOT = path.join(process.cwd(), "private", "uploads");

export function isKycStorageKey(key: string): boolean {
  return key.includes(KYC_KEY_SEGMENT);
}

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

/** Bucket público — avatars, mídia de alerta, sons, fundos. */
function getPublicBucket(): string {
  return process.env.AWS_S3_BUCKET!;
}

/**
 * Bucket privado — documentos KYC (RG, selfie).
 * Use um bucket separado sem domínio CDN público.
 */
function getKycBucket(): string {
  return process.env.AWS_S3_KYC_BUCKET?.trim() || getPublicBucket();
}

function contentTypeFromKey(key: string): string {
  const ext = path.extname(key).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

/**
 * Upload público — retorna URL do CDN para exibição no site.
 */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (isS3Enabled()) {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: getPublicBucket(),
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return getPublicUrl(key);
  }

  const filePath = path.join(PUBLIC_LOCAL_ROOT, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return getPublicUrl(key);
}

/**
 * Upload privado — documentos KYC. Não gera URL pública.
 * Em produção: bucket privado (AWS_S3_KYC_BUCKET), sem CDN.
 */
export async function uploadPrivateFile(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (isS3Enabled()) {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: getKycBucket(),
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "private, no-store",
      }),
    );
    return key;
  }

  const filePath = path.join(PRIVATE_LOCAL_ROOT, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return key;
}

export async function readPrivateFile(key: string): Promise<{
  buffer: Buffer;
  contentType: string;
} | null> {
  const contentType = contentTypeFromKey(key);

  if (isS3Enabled()) {
    const client = getS3Client();
    try {
      const res = await client.send(
        new GetObjectCommand({
          Bucket: getKycBucket(),
          Key: key,
        }),
      );
      if (!res.Body) return null;
      const bytes = await res.Body.transformToByteArray();
      return {
        buffer: Buffer.from(bytes),
        contentType: res.ContentType ?? contentType,
      };
    } catch {
      return null;
    }
  }

  const filePath = path.join(PRIVATE_LOCAL_ROOT, key);
  try {
    const buffer = await readFile(filePath);
    return { buffer, contentType };
  } catch {
    // Migração: arquivos KYC antigos em public/uploads/
    const legacyPath = path.join(PUBLIC_LOCAL_ROOT, key);
    try {
      const buffer = await readFile(legacyPath);
      return { buffer, contentType };
    } catch {
      return null;
    }
  }
}

/** URL pré-assinada para admin visualizar documento KYC (expira em 5 min). */
export async function getPresignedUrl(
  key: string,
  expiresInSeconds = 300,
): Promise<string | null> {
  if (!isS3Enabled() || !isKycStorageKey(key)) return null;

  const client = getS3Client();
  try {
    return await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: getKycBucket(),
        Key: key,
      }),
      { expiresIn: expiresInSeconds },
    );
  } catch {
    return null;
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (isKycStorageKey(key)) {
    await deletePrivateFile(key);
    return;
  }

  if (isS3Enabled()) {
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: getPublicBucket(),
        Key: key,
      }),
    );
    return;
  }

  const filePath = path.join(PUBLIC_LOCAL_ROOT, key);
  try {
    await unlink(filePath);
  } catch {
    // arquivo pode já ter sido removido
  }
}

export async function deletePrivateFile(key: string): Promise<void> {
  if (isS3Enabled()) {
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: getKycBucket(),
        Key: key,
      }),
    );
    return;
  }

  const filePath = path.join(PRIVATE_LOCAL_ROOT, key);
  try {
    await unlink(filePath);
  } catch {
    // ignore
  }

  // Remove legado em public/uploads/
  const legacyPath = path.join(PUBLIC_LOCAL_ROOT, key);
  try {
    await unlink(legacyPath);
  } catch {
    // ignore
  }
}

export function getPublicUrl(key: string): string {
  const cdn = process.env.AWS_CDN_URL?.replace(/\/$/, "");
  if (cdn) {
    return `${cdn}/${key}`;
  }

  if (isS3Enabled()) {
    const bucket = getPublicBucket();
    const endpoint = process.env.AWS_S3_ENDPOINT?.replace(/\/$/, "");
    if (endpoint) {
      return `${endpoint}/${bucket}/${key}`;
    }
    const region = process.env.AWS_REGION ?? "us-east-1";
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  return `/uploads/${key.replace(/\\/g, "/")}`;
}

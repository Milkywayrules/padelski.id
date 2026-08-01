import { z } from "zod";

function normalizePrefix(prefix: string): string {
  const trimmed = prefix.trim();
  if (trimmed === "") {
    return "";
  }
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function normalizeSegment(segment: string): string {
  const trimmed = segment.trim();
  if (trimmed === "" || trimmed === "/") {
    throw new Error("Object key segment must not be empty");
  }
  return trimmed.replace(/^\/+|\/+$/g, "");
}

export const storageConfigSchema = z.object({
  accountId: z.string().min(1),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  bucketName: z.string().min(1),
  prefix: z.string().transform(normalizePrefix),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;

export function buildObjectKey(prefix: string, ...segments: string[]): string {
  if (segments.length === 0) {
    throw new Error("At least one object key segment is required");
  }

  const parts: string[] = [];
  const normalizedPrefix = normalizePrefix(prefix);

  if (normalizedPrefix) {
    parts.push(normalizedPrefix.slice(0, -1));
  }

  for (const segment of segments) {
    parts.push(normalizeSegment(segment));
  }

  const key = parts.join("/");
  if (key.startsWith("/")) {
    throw new Error("Object key must not start with /");
  }

  return key;
}

export interface PutObjectInput {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}

export interface GetObjectResult {
  body: Buffer;
  contentType?: string;
}

export interface ObjectStorage {
  putObject(input: PutObjectInput): Promise<void>;
  getObject(key: string): Promise<GetObjectResult | null>;
  getPresignedUploadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}

const stubDefaults: StorageConfig = {
  accountId: "stub-account",
  accessKeyId: "stub-access-key",
  secretAccessKey: "stub-secret-key",
  bucketName: "stub-bucket",
  prefix: "uploads/",
};

function toBuffer(body: Buffer | Uint8Array | string): Buffer {
  if (typeof body === "string") {
    return Buffer.from(body, "utf8");
  }
  return Buffer.from(body);
}

export function createStorageStub(config?: Partial<StorageConfig>): ObjectStorage {
  const parsed = storageConfigSchema.parse({ ...stubDefaults, ...config });
  const objects = new Map<string, GetObjectResult>();

  return {
    async putObject(input) {
      const stored: GetObjectResult = { body: toBuffer(input.body) };
      if (input.contentType !== undefined) {
        stored.contentType = input.contentType;
      }
      objects.set(input.key, stored);
    },

    async getObject(key) {
      return objects.get(key) ?? null;
    },

    async getPresignedUploadUrl(key, expiresInSeconds = 3600) {
      const encodedKey = encodeURIComponent(key);
      return `https://stub-storage.example.com/${parsed.accountId}/${parsed.bucketName}/${encodedKey}?X-Amz-Expires=${expiresInSeconds}&stub=1`;
    },

    async deleteObject(key) {
      objects.delete(key);
    },
  };
}

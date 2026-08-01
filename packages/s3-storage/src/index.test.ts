import { describe, expect, it } from "vitest";
import { buildObjectKey, createStorageStub, storageConfigSchema } from "./index";

describe("storageConfigSchema", () => {
  it("normalizes prefix to end with /", () => {
    expect(
      storageConfigSchema.parse({
        accountId: "acc",
        accessKeyId: "key",
        secretAccessKey: "secret",
        bucketName: "bucket",
        prefix: "uploads",
      }).prefix,
    ).toBe("uploads/");
  });

  it("preserves prefix that already ends with /", () => {
    expect(
      storageConfigSchema.parse({
        accountId: "acc",
        accessKeyId: "key",
        secretAccessKey: "secret",
        bucketName: "bucket",
        prefix: "media/",
      }).prefix,
    ).toBe("media/");
  });
});

describe("buildObjectKey", () => {
  it("joins prefix and segments without leading slashes", () => {
    expect(buildObjectKey("uploads/", "users", "avatar.png")).toBe("uploads/users/avatar.png");
  });

  it("normalizes prefix without trailing slash", () => {
    expect(buildObjectKey("uploads", "users", "avatar.png")).toBe("uploads/users/avatar.png");
  });

  it("strips leading and trailing slashes from segments", () => {
    expect(buildObjectKey("uploads/", "/users/", "/avatar.png")).toBe("uploads/users/avatar.png");
  });

  it("works with empty prefix", () => {
    expect(buildObjectKey("", "users", "avatar.png")).toBe("users/avatar.png");
  });

  it("rejects empty segments", () => {
    expect(() => buildObjectKey("uploads/", "", "file.png")).toThrow(
      "Object key segment must not be empty",
    );
  });

  it("requires at least one segment", () => {
    expect(() => buildObjectKey("uploads/")).toThrow("At least one object key segment is required");
  });
});

describe("createStorageStub", () => {
  it("stores and retrieves objects in memory", async () => {
    const storage = createStorageStub();
    const key = buildObjectKey("uploads/", "users", "doc.txt");

    await storage.putObject({ key, body: "hello", contentType: "text/plain" });
    const result = await storage.getObject(key);

    expect(result?.body.toString("utf8")).toBe("hello");
    expect(result?.contentType).toBe("text/plain");
  });

  it("returns null for missing objects", async () => {
    const storage = createStorageStub();
    expect(await storage.getObject("missing/key")).toBeNull();
  });

  it("returns a fake presigned upload url", async () => {
    const storage = createStorageStub({
      accountId: "test-account",
      bucketName: "test-bucket",
    });
    const url = await storage.getPresignedUploadUrl("uploads/file.png", 900);

    expect(url).toContain("stub-storage.example.com");
    expect(url).toContain("test-account");
    expect(url).toContain("test-bucket");
    expect(url).toContain("X-Amz-Expires=900");
    expect(url).toContain("stub=1");
  });

  it("deletes stored objects", async () => {
    const storage = createStorageStub();
    const key = "uploads/to-delete.txt";

    await storage.putObject({ key, body: "temp" });
    await storage.deleteObject(key);

    expect(await storage.getObject(key)).toBeNull();
  });
});

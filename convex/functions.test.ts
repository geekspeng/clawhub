/* @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import { syncPackageSearchDigestForPackageId } from "./functions";

describe("package digest sync", () => {
  it("clears latestVersion when the current package release is soft-deleted", async () => {
    const pkg = {
      _id: "packages:demo",
      name: "demo-plugin",
      normalizedName: "demo-plugin",
      displayName: "Demo Plugin",
      family: "code-plugin",
      channel: "community",
      isOfficial: false,
      ownerUserId: "users:owner",
      summary: "demo",
      capabilityTags: ["tools"],
      executesCode: true,
      runtimeId: null,
      softDeletedAt: undefined,
      createdAt: 1,
      updatedAt: 2,
      latestReleaseId: "packageReleases:demo-2",
      latestVersionSummary: { version: "2.0.0" },
      verification: { tier: "community" },
    };
    const latestRelease = {
      _id: "packageReleases:demo-2",
      version: "2.0.0",
      softDeletedAt: 10,
    };
    const owner = {
      _id: "users:owner",
      handle: "owner",
      deletedAt: undefined,
      deactivatedAt: undefined,
    };
    const ctx = {
      db: {
        get: vi.fn(async (id: string) => {
          if (id === "packages:demo") return pkg;
          if (id === "packageReleases:demo-2") return latestRelease;
          if (id === "users:owner") return owner;
          return null;
        }),
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            unique: vi.fn().mockResolvedValue(null),
          })),
        })),
        patch: vi.fn(),
        insert: vi.fn(),
        delete: vi.fn(),
      },
    };

    await syncPackageSearchDigestForPackageId(
      ctx as never,
      "packages:demo" as never,
    );

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "packageSearchDigest",
      expect.objectContaining({
        packageId: "packages:demo",
        latestVersion: undefined,
        ownerHandle: "owner",
      }),
    );
  });
});

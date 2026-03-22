import { customCtx, customMutation } from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import type { DataModel, Doc, Id } from "./_generated/dataModel";
import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
  query,
  internalQuery,
  action,
  internalAction,
  httpAction,
} from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import {
  extractPackageDigestFields,
  upsertPackageSearchDigest,
} from "./lib/packageSearchDigest";
import { extractDigestFields, upsertSkillSearchDigest } from "./lib/skillSearchDigest";

const triggers = new Triggers<DataModel>();

type PackageDigestSyncCtx = Pick<MutationCtx, "db">;

async function syncPackageSearchDigest(
  ctx: PackageDigestSyncCtx,
  pkg: Doc<"packages"> | null | undefined,
) {
  if (!pkg) return;
  const latestRelease = pkg.latestReleaseId ? await ctx.db.get(pkg.latestReleaseId) : null;
  const fields = extractPackageDigestFields(pkg);
  const owner = await ctx.db.get(pkg.ownerUserId);
  await upsertPackageSearchDigest(ctx, {
    ...fields,
    latestVersion:
      latestRelease &&
      typeof latestRelease === "object" &&
      latestRelease &&
      "softDeletedAt" in latestRelease &&
      "version" in latestRelease &&
      !latestRelease.softDeletedAt
        ? latestRelease.version
        : undefined,
    ownerHandle:
      owner &&
      typeof owner === "object" &&
      owner &&
      !("deletedAt" in owner && owner.deletedAt) &&
      !("deactivatedAt" in owner && owner.deactivatedAt) &&
      "handle" in owner
        ? ((owner.handle as string | undefined) ?? "")
        : "",
  });
}

export async function syncPackageSearchDigestForPackageId(
  ctx: PackageDigestSyncCtx,
  packageId: Id<"packages"> | null | undefined,
) {
  if (!packageId) return;
  const pkg = await ctx.db.get(packageId);
  if (!pkg) return;
  await syncPackageSearchDigest(ctx, pkg);
}

triggers.register("skills", async (ctx, change) => {
  if (change.operation === "delete") {
    const existing = await ctx.db
      .query("skillSearchDigest")
      .withIndex("by_skill", (q) => q.eq("skillId", change.id))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  } else {
    const fields = extractDigestFields(change.newDoc);
    const owner = await ctx.db.get(change.newDoc.ownerUserId);
    const isOwnerVisible = owner && !owner.deletedAt && !owner.deactivatedAt;
    await upsertSkillSearchDigest(ctx, {
      ...fields,
      // Use '' as sentinel for "visible user without a handle" so
      // digestToOwnerInfo can distinguish from undefined (not backfilled).
      // Deactivated/deleted owners also get '' → digestToOwnerInfo returns
      // null owner, matching the live path.
      ownerHandle: isOwnerVisible ? (owner.handle ?? "") : "",
      ownerName: isOwnerVisible ? owner.name : undefined,
      ownerDisplayName: isOwnerVisible ? owner.displayName : undefined,
      ownerImage: isOwnerVisible ? owner.image : undefined,
    });
  }
});

triggers.register("packages", async (ctx, change) => {
  if (change.operation === "delete") {
    const existing = await ctx.db
      .query("packageSearchDigest")
      .withIndex("by_package", (q) => q.eq("packageId", change.id))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return;
  }

  await syncPackageSearchDigest(ctx, change.newDoc);
});

triggers.register("packageReleases", async (ctx, change) => {
  if (change.operation === "insert") return;
  if (change.operation === "update" && change.oldDoc.softDeletedAt === change.newDoc.softDeletedAt) {
    return;
  }
  const packageId =
    change.operation === "delete" ? change.oldDoc.packageId : change.newDoc.packageId;
  await syncPackageSearchDigestForPackageId(ctx, packageId);
});

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));
export { query, internalQuery, action, internalAction, httpAction };

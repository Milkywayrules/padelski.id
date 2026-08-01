import type { Database } from "@padelski/db";
import { players } from "@padelski/db/schema";
import { eq } from "drizzle-orm";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  nickname?: string | null;
};

export function sanitizeNickname(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 24);
  return normalized.length > 0 ? normalized : "player";
}

export function deriveBaseNickname(user: AuthUser): string {
  if (user.nickname?.trim()) {
    return sanitizeNickname(user.nickname);
  }

  const fromName = sanitizeNickname(user.name);
  if (fromName !== "player") {
    return fromName;
  }

  const localPart = user.email.split("@")[0] ?? "player";
  return sanitizeNickname(localPart);
}

async function nicknameExists(db: Database, nickname: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.nickname, nickname));
  return existing !== undefined;
}

async function pickUniqueNickname(db: Database, user: AuthUser): Promise<string> {
  const base = deriveBaseNickname(user);
  if (!(await nicknameExists(db, base))) {
    return base;
  }

  const suffix = user.id.replace(/-/g, "").slice(0, 8);
  const withSuffix = `${base}-${suffix}`.slice(0, 32);
  if (!(await nicknameExists(db, withSuffix))) {
    return withSuffix;
  }

  return `player-${suffix}`;
}

export async function linkPlayerForAuthUser(db: Database, user: AuthUser): Promise<void> {
  const [existing] = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.userId, user.id));

  if (existing) {
    return;
  }

  const nickname = await pickUniqueNickname(db, user);

  await db
    .insert(players)
    .values({
      nickname,
      fullName: user.name.trim().length > 0 ? user.name : null,
      userId: user.id,
    })
    .onConflictDoNothing();
}

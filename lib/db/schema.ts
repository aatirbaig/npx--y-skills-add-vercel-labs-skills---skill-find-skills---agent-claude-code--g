import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const MEMBERSHIPS = ["free", "premium", "lifetime"] as const;
export type Membership = (typeof MEMBERSHIPS)[number];

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),

  // FoundersBee columns. Stripe is the source of truth for entitlement; these
  // are a cache written by the webhook so page renders stay fast.
  stripeCustomerId: text("stripeCustomerId"),
  membership: text("membership", { enum: MEMBERSHIPS }).notNull().default("free"),
  membershipUntil: integer("membershipUntil", { mode: "timestamp_ms" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })],
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export const savedDeals = sqliteTable(
  "saved_deal",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dealSlug: text("dealSlug").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.dealSlug] })],
);

/**
 * A claim is recorded when a member reveals a deal's redemption. It powers the
 * "you have unlocked $X" figure on the dashboard and, later, redemption counts
 * for partners.
 */
export const claims = sqliteTable(
  "claim",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dealSlug: text("dealSlug").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.dealSlug] })],
);

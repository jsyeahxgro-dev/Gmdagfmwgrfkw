import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bridgeTier: text("bridge_tier").notNull().default("NR"),
  skywarsTier: text("skywars_tier").notNull().default("NR"),
  crystalTier: text("crystal_tier").notNull().default("NR"),
  midfightTier: text("midfight_tier").notNull().default("NR"),
  uhcTier: text("uhc_tier").notNull().default("NR"),
  nodebuffTier: text("nodebuff_tier").notNull().default("NR"),
  bedfightTier: text("bedfight_tier").notNull().default("NR"),
  sumoTier: text("sumo_tier").notNull().default("NR"),
  isRetired: boolean("is_retired").notNull().default(false),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export const tierOptions = ["HT1", "HT2", "HT3", "LT1", "LT2", "LT3", "LT4", "LT5", "NR"] as const;
export const titleOptions = ["Combat Grandmaster", "Combat Master", "Combat Ace", "Combat Specialist"] as const;

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
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export const tierOptions = ["HT1", "HT2", "HT3", "LT1", "LT2", "LT3", "LT4", "LT5", "NR"] as const;
export const titleOptions = ["Combat Grandmaster", "Combat Master", "Combat Ace", "Combat Specialist"] as const;

export const gameModes = [
  { key: 'overall', name: 'Overall', icon: '🏆' },
  { key: 'skywars', name: 'Skywars', icon: '☁️' },
  { key: 'midfight', name: 'Midfight', icon: '⚔️' },
  { key: 'nodebuff', name: 'Nodebuff', icon: '🛡️' },
  { key: 'bedfight', name: 'Bedfight', icon: '🛏️' },
  { key: 'uhc', name: 'UHC', icon: '💀' }
] as const;

export type GameMode = typeof gameModes[number]['key'];

export const tierLevels = [
  { key: 'T1', name: 'TIER 1', tiers: ['HT1', 'LT1'], color: 'from-yellow-400 to-yellow-600', textColor: 'text-yellow-900' },
  { key: 'T2', name: 'TIER 2', tiers: ['HT2', 'LT2'], color: 'from-gray-300 to-gray-500', textColor: 'text-gray-900' },
  { key: 'T3', name: 'TIER 3', tiers: ['HT3', 'LT3'], color: 'from-orange-400 to-orange-600', textColor: 'text-orange-900' },
  { key: 'T4', name: 'TIER 4', tiers: ['LT4', 'LT5'], color: 'from-green-400 to-green-600', textColor: 'text-green-900' }
] as const;

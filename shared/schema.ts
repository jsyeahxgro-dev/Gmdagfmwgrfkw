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

export const tierOptions = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5", "NR"] as const;
export const titleOptions = ["Combat Grandmaster", "Combat Master", "Combat Ace", "Combat Specialist"] as const;

export const gameModes = [
  { key: 'overall', name: 'Overall', icon: '🏆', abbr: 'Overall' },
  { key: 'skywars', name: 'Skywars', icon: '☁️', abbr: 'SW' },
  { key: 'midfight', name: 'Midfight', icon: '⚔️', abbr: 'Midf' },
  { key: 'nodebuff', name: 'Nodebuff', icon: '🛡️', abbr: 'NoDb' },
  { key: 'bedfight', name: 'Bedfight', icon: '🛏️', abbr: 'Bed' },
  { key: 'uhc', name: 'UHC', icon: '💀', abbr: 'UHC' }
] as const;

export type GameMode = typeof gameModes[number]['key'];

export const tierLevels = [
  { key: 'T1', name: 'TIER 1', tiers: ['HT1', 'MIDT1', 'LT1'], color: 'from-white to-gray-100', textColor: 'text-gray-900' },
  { key: 'T2', name: 'TIER 2', tiers: ['HT2', 'MIDT2', 'LT2'], color: 'from-white to-gray-100', textColor: 'text-gray-900' },
  { key: 'T3', name: 'TIER 3', tiers: ['HT3', 'MIDT3', 'LT3'], color: 'from-white to-gray-100', textColor: 'text-gray-900' },
  { key: 'T4', name: 'TIER 4', tiers: ['HT4', 'MIDT4', 'LT4'], color: 'from-white to-gray-100', textColor: 'text-gray-900' },
  { key: 'T5', name: 'TIER 5', tiers: ['HT5', 'MIDT5', 'LT5'], color: 'from-white to-gray-100', textColor: 'text-gray-900' }
] as const;

export const getTierColor = (tier: string) => {
  if (tier.startsWith('HT')) return 'border-l-red-500 bg-red-50 dark:bg-red-950';
  if (tier.startsWith('MIDT')) return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950';
  if (tier.startsWith('LT')) return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
  return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950';
};

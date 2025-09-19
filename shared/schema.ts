import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  skywarsTier: text("skywars_tier").notNull().default("NR"),
  midfightTier: text("midfight_tier").notNull().default("NR"),
  uhcTier: text("uhc_tier").notNull().default("NR"),
  nodebuffTier: text("nodebuff_tier").notNull().default("NR"),
  bedfightTier: text("bedfight_tier").notNull().default("NR"),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export const tierOptions = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5", "NR"] as const;
export const titleOptions = [
  "Rookie",
  "Cadet",
  "Specialist", 
  "Ace",
  "Elite",
  "Master",
  "Grandmaster"
] as const;

export const gameModes = [
  { key: 'overall', name: 'Overall', icon: '🏆', abbr: 'Overall' },
  { key: 'skywars', name: 'Skywars', icon: '☁️', abbr: 'SW' },
  { key: 'midfight', name: 'Midfight', icon: '⚔️', abbr: 'Midf' },
  { key: 'uhc', name: 'UHC', icon: '💀', abbr: 'UHC' },
  { key: 'nodebuff', name: 'Nodebuff', icon: '🛡️', abbr: 'NoDb' },
  { key: 'bedfight', name: 'Bedfight', icon: '🛏️', abbr: 'Bed' }
] as const;

export type GameMode = typeof gameModes[number]['key'];

export const tierLevels = [
  { key: 'S Tier', name: 'ST', tiers: ['HT1', 'MIDT1', 'LT1'], color: 'from-slate-800 to-slate-900', textColor: 'text-white' },
  { key: 'A Tier', name: 'AT', tiers: ['HT2', 'MIDT2', 'LT2'], color: 'from-slate-800 to-slate-900', textColor: 'text-white' },
  { key: 'B Tier', name: 'BT', tiers: ['HT3', 'MIDT3', 'LT3'], color: 'from-slate-800 to-slate-900', textColor: 'text-white' },
  { key: 'C Tier', name: 'CT', tiers: ['HT4', 'MIDT4', 'LT4'], color: 'from-slate-800 to-slate-900', textColor: 'text-white' },
  { key: 'D Tier', name: 'DT', tiers: ['HT5', 'MIDT5', 'LT5'], color: 'from-slate-800 to-slate-900', textColor: 'text-white' }
] as const;

export const getTierColor = (tier: string, isOverall: boolean = false) => {
  if (isOverall && tier !== 'NR') {
    // All tiers have same color in overall view except NR
    return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
  }
  
  if (tier.startsWith('HT')) return 'border-l-red-500 bg-red-50 dark:bg-red-950';
  if (tier.startsWith('MIDT')) return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950';
  if (tier.startsWith('LT')) return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
  return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950';
};

// Points system mapping
export const tierPoints = {
  'HT1': 100, 'MIDT1': 90, 'LT1': 80,  // S Tier
  'HT2': 70,  'MIDT2': 65, 'LT2': 60,  // A Tier
  'HT3': 50,  'MIDT3': 45, 'LT3': 40,  // B Tier
  'HT4': 30,  'MIDT4': 25, 'LT4': 20,  // C Tier
  'HT5': 10,  'MIDT5': 8,  'LT5': 6,   // D Tier
  'NR': 0
} as const;

export const getPointsForTier = (tier: string): number => {
  return tierPoints[tier as keyof typeof tierPoints] || 0;
};

export const calculatePlayerPoints = (player: Player): number => {
  return getPointsForTier(player.skywarsTier) +
         getPointsForTier(player.midfightTier) +
         getPointsForTier(player.uhcTier) +
         getPointsForTier(player.nodebuffTier) +
         getPointsForTier(player.bedfightTier);
};

export const getTitleFromPoints = (points: number): string => {
  if (points >= 450) return 'Grandmaster';
  if (points >= 350) return 'Master';
  if (points >= 275) return 'Elite';
  if (points >= 200) return 'Ace';
  if (points >= 125) return 'Specialist';
  if (points >= 50) return 'Cadet';
  return 'Rookie';
};

export const getTierDisplayName = (tier: string): string => {
  const tierDisplayNames: Record<string, string> = {
    'HT1': 'HighS',
    'MIDT1': 'MidS', 
    'LT1': 'LowS',
    'HT2': 'HighA',
    'MIDT2': 'MidA',
    'LT2': 'LowA', 
    'HT3': 'HighB',
    'MIDT3': 'MidB',
    'LT3': 'LowB',
    'HT4': 'HighC', 
    'MIDT4': 'MidC',
    'LT4': 'LowC',
    'HT5': 'HighD',
    'MIDT5': 'MidD',
    'LT5': 'LowD',
    'NR': 'Not Ranked'
  };
  return tierDisplayNames[tier] || tier;
};

// Reorder schema validation
const gameModesForReorder = ['skywars', 'midfight', 'uhc', 'nodebuff', 'bedfight'] as const;
const tierKeysForReorder = ['S Tier', 'A Tier', 'B Tier', 'C Tier', 'D Tier'] as const;

export const reorderSchema = z.object({
  tierKey: z.enum(tierKeysForReorder),
  playerOrders: z.array(z.string().uuid()).min(1),
});

export type ReorderData = z.infer<typeof reorderSchema>;

export const adminAuthSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type AdminAuthData = z.infer<typeof adminAuthSchema>;

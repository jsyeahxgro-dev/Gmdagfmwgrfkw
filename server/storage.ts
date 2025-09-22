import { type Player, type InsertPlayer, players, tierOrders, type GameModeForReorder, type TierLetter, type ReorderResponse } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByName(name: string): Promise<Player | undefined>;
  getAllPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player>;
  deletePlayer(id: string): Promise<boolean>;
  
  // New versioned tier order methods
  getTierOrder(gameMode: GameModeForReorder, tier: TierLetter): Promise<ReorderResponse>;
  setTierOrder(gameMode: GameModeForReorder, tier: TierLetter, playerIds: string[], expectedVersion?: number): Promise<ReorderResponse>;
  validateTierOrder(gameMode: GameModeForReorder, tier: TierLetter, playerIds: string[]): Promise<boolean>;
  
  // Legacy methods (will be deprecated)
  getTierOrderLegacy(tierKey: string): Promise<string[]>;
  setTierOrderLegacy(tierKey: string, playerOrders: string[]): Promise<boolean>;
  validatePlayerOrders(tierKey: string, playerOrders: string[]): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private tierOrders: Map<string, string[]>;
  private tierVersions: Map<string, number>;
  private tierMutexes: Map<string, Promise<any>>;

  constructor() {
    this.tierOrders = new Map();
    this.tierVersions = new Map();
    this.tierMutexes = new Map();
    this.seedInitialData();
  }

  private async seedInitialData() {
    try {
      // Check if data already exists
      const existingPlayers = await db.select().from(players);
      if (existingPlayers.length > 0) {
        return; // Data already exists, no need to seed
      }

      // Seed initial data
      const initialPlayers: Omit<Player, 'id'>[] = [
        // S Tier Players
        {
          name: "D3j4411",
          skywarsTier: "HT1",
          midfightTier: "HT1",
          uhcTier: "HT2",
          nodebuffTier: "NR",
          bedfightTier: "NR"
        },
        {
          name: "Velfair",
          skywarsTier: "HT1",
          midfightTier: "HT2",
          uhcTier: "HT1",
          nodebuffTier: "HT3",
          bedfightTier: "NR"
        },
        {
          name: "DR0IDv",
          skywarsTier: "HT1",
          midfightTier: "NR",
          uhcTier: "HT2",
          nodebuffTier: "HT1",
          bedfightTier: "HT3"
        },
        {
          name: "Torqueyckpio",
          skywarsTier: "MIDT1",
          midfightTier: "HT2",
          uhcTier: "HT3",
          nodebuffTier: "NR",
          bedfightTier: "LT1"
        },
        {
          name: "RivaV0cals",
          skywarsTier: "HT1",
          midfightTier: "HT3",
          uhcTier: "HT2",
          nodebuffTier: "NR",
          bedfightTier: "NR"
        },
        // A Tier Players  
        {
          name: "ItzAaronHi",
          skywarsTier: "HT2",
          midfightTier: "MIDT2",
          uhcTier: "LT1",
          nodebuffTier: "NR",
          bedfightTier: "NR"
        },
        {
          name: "zAmqni",
          skywarsTier: "HT2",
          midfightTier: "NR",
          uhcTier: "MIDT1",
          nodebuffTier: "HT3",
          bedfightTier: "NR"
        },
        {
          name: "Mikeyandroid",
          skywarsTier: "MIDT2",
          midfightTier: "HT3",
          uhcTier: "LT2",
          nodebuffTier: "NR",
          bedfightTier: "LT1"
        },
        // B Tier Players
        {
          name: "EletricHayden",
          skywarsTier: "HT3",
          midfightTier: "MIDT3",
          uhcTier: "NR",
          nodebuffTier: "NR",
          bedfightTier: "NR"
        },
        {
          name: "FlamePvPs",
          skywarsTier: "MIDT3",
          midfightTier: "LT2",
          uhcTier: "LT3",
          nodebuffTier: "NR",
          bedfightTier: "NR"
        },
        // C Tier Players
        {
          name: "ComicBiscuit778",
          skywarsTier: "LT1",
          midfightTier: "LT4",
          uhcTier: "NR",
          nodebuffTier: "NR",
          bedfightTier: "NR"
        },
        {
          name: "EfrazBR",
          skywarsTier: "NR",
          midfightTier: "NR",
          uhcTier: "NR",
          nodebuffTier: "LT1",
          bedfightTier: "LT3"
        }
      ];

      // Insert initial players
      for (const playerData of initialPlayers) {
        await db.insert(players).values(playerData);
      }
    } catch (error) {
      console.log('Error seeding initial data:', error);
    }
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const result = await db.select().from(players).where(eq(players.id, id));
    return result[0];
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    const result = await db.select().from(players).where(eq(players.name, name));
    return result[0];
  }

  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const playerData = {
      ...insertPlayer,
      skywarsTier: insertPlayer.skywarsTier || "NR",
      midfightTier: insertPlayer.midfightTier || "NR",
      uhcTier: insertPlayer.uhcTier || "NR",
      nodebuffTier: insertPlayer.nodebuffTier || "NR",
      bedfightTier: insertPlayer.bedfightTier || "NR"
    };
    
    const result = await db.insert(players).values(playerData).returning();
    return result[0];
  }

  async updatePlayer(id: string, updateData: Partial<InsertPlayer>): Promise<Player> {
    const result = await db.update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("Player not found");
    }
    
    return result[0];
  }

  async deletePlayer(id: string): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.id, id)).returning();
    
    if (result.length > 0) {
      // Remove from all tier orders
      for (const [tierKey, orders] of Array.from(this.tierOrders.entries())) {
        const newOrders = orders.filter((playerId: string) => playerId !== id);
        if (newOrders.length !== orders.length) {
          this.tierOrders.set(tierKey, newOrders);
          // Persist to database
          await db.insert(tierOrders)
            .values({ tierKey, playerOrders: newOrders, version: 0 })
            .onConflictDoUpdate({
              target: tierOrders.tierKey,
              set: { playerOrders: newOrders }
            });
        }
      }
    }
    
    return result.length > 0;
  }

  // New versioned tier order methods
  private createTierKey(gameMode: GameModeForReorder, tier: TierLetter): string {
    return `${gameMode}:${tier}`;
  }

  private async withMutex<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Wait for any existing operation on this key to complete
    const existingMutex = this.tierMutexes.get(key);
    if (existingMutex) {
      await existingMutex;
    }

    // Create new mutex for this operation
    const mutex = fn();
    this.tierMutexes.set(key, mutex);
    
    try {
      const result = await mutex;
      return result;
    } finally {
      // Clean up the mutex
      this.tierMutexes.delete(key);
    }
  }

  async getTierOrder(gameMode: GameModeForReorder, tier: TierLetter): Promise<ReorderResponse> {
    const key = this.createTierKey(gameMode, tier);
    const playerIds = this.tierOrders.get(key) || [];
    const version = this.tierVersions.get(key) || 0;
    
    return {
      gameMode,
      tier,
      playerIds,
      version
    };
  }

  async setTierOrder(gameMode: GameModeForReorder, tier: TierLetter, playerIds: string[], expectedVersion?: number): Promise<ReorderResponse> {
    const key = this.createTierKey(gameMode, tier);
    
    return this.withMutex(key, async () => {
      const currentVersion = this.tierVersions.get(key) || 0;
      
      // Check version conflict
      if (expectedVersion !== undefined && expectedVersion < currentVersion) {
        throw new Error(`Version conflict: expected ${expectedVersion}, current ${currentVersion}`);
      }
      
      // Validate the order
      const isValid = await this.validateTierOrder(gameMode, tier, playerIds);
      if (!isValid) {
        throw new Error("Invalid player order for tier");
      }
      
      // Update order and increment version
      const newVersion = currentVersion + 1;
      this.tierOrders.set(key, playerIds);
      this.tierVersions.set(key, newVersion);
      
      return {
        gameMode,
        tier,
        playerIds,
        version: newVersion
      };
    });
  }

  async validateTierOrder(gameMode: GameModeForReorder, tier: TierLetter, playerIds: string[]): Promise<boolean> {
    // Check for duplicates
    if (new Set(playerIds).size !== playerIds.length) {
      return false;
    }

    // Map tier letters to their tier values
    const tierMapping: Record<TierLetter, string[]> = {
      'S': ['HT1', 'MIDT1', 'LT1'],
      'A': ['HT2', 'MIDT2', 'LT2'],
      'B': ['HT3', 'MIDT3', 'LT3'],
      'C': ['HT4', 'MIDT4', 'LT4'],
      'D': ['HT5', 'MIDT5', 'LT5']
    };

    const allowedTiers = tierMapping[tier];
    if (!allowedTiers) {
      return false;
    }

    // Validate all player IDs exist and belong to the correct tier
    for (const playerId of playerIds) {
      const result = await db.select().from(players).where(eq(players.id, playerId));
      if (result.length === 0) {
        return false;
      }
      const player = result[0];
      
      // Get the specific tier for this game mode
      let playerTierValue: string;
      switch (gameMode) {
        case 'skywars': playerTierValue = player.skywarsTier; break;
        case 'midfight': playerTierValue = player.midfightTier; break;
        case 'uhc': playerTierValue = player.uhcTier; break;
        case 'nodebuff': playerTierValue = player.nodebuffTier; break;
        case 'bedfight': playerTierValue = player.bedfightTier; break;
        default: return false;
      }
      
      // Check if player's tier for this game mode matches the allowed tiers
      if (!allowedTiers.includes(playerTierValue)) {
        return false;
      }
    }

    return true;
  }

  // Legacy methods (deprecated)
  async getTierOrderLegacy(tierKey: string): Promise<string[]> {
    // Check memory cache first
    if (this.tierOrders.has(tierKey)) {
      return this.tierOrders.get(tierKey) || [];
    }

    // Load from database
    try {
      const result = await db.select().from(tierOrders).where(eq(tierOrders.tierKey, tierKey));
      
      if (result.length > 0) {
        const orders = result[0].playerOrders as string[];
        this.tierOrders.set(tierKey, orders);
        return orders;
      }
    } catch (error) {
      console.log('Error loading tier orders:', error);
    }

    return [];
  }

  async setTierOrderLegacy(tierKey: string, playerOrders: string[]): Promise<boolean> {
    // Validate that all players exist and belong to the specified tier
    const isValid = await this.validatePlayerOrders(tierKey, playerOrders);
    if (!isValid) {
      throw new Error("Invalid player orders for tier");
    }

    try {
      // Save to database
      await db.insert(tierOrders)
        .values({ tierKey, playerOrders: playerOrders, version: 0 })
        .onConflictDoUpdate({
          target: tierOrders.tierKey,
          set: { playerOrders: playerOrders }
        });

      // Update memory cache
      this.tierOrders.set(tierKey, playerOrders);
      return true;
    } catch (error) {
      console.log('Error saving tier orders:', error);
      throw new Error("Failed to save tier order");
    }
  }

  async validatePlayerOrders(tierKey: string, playerOrders: string[]): Promise<boolean> {
    // Check for duplicates
    if (new Set(playerOrders).size !== playerOrders.length) {
      return false;
    }

    // Extract game mode and tier name from full tierKey format (e.g., "skywars-S Tier" -> gameMode: "skywars", tierName: "S Tier")
    const parts = tierKey.split('-');
    if (parts.length !== 2) {
      return false; // Invalid tierKey format
    }
    
    const gameMode = parts[0];
    const tierName = parts[1];

    // Map tier keys to their tier values
    const tierMapping: Record<string, string[]> = {
      'S Tier': ['HT1', 'MIDT1', 'LT1'],
      'A Tier': ['HT2', 'MIDT2', 'LT2'],
      'B Tier': ['HT3', 'MIDT3', 'LT3'], 
      'C Tier': ['HT4', 'MIDT4', 'LT4'],
      'D Tier': ['HT5', 'MIDT5', 'LT5']
    };

    const allowedTiers = tierMapping[tierName];
    if (!allowedTiers) {
      return false;
    }

    // Validate all player IDs exist in database and belong to correct tier for the specific game mode
    try {
      for (const playerId of playerOrders) {
        const result = await db.select().from(players).where(eq(players.id, playerId));
        if (result.length === 0) {
          return false;
        }
        
        const player = result[0];
        
        // Get the specific tier for this game mode
        let playerTierValue: string;
        switch (gameMode) {
          case 'skywars': playerTierValue = player.skywarsTier; break;
          case 'midfight': playerTierValue = player.midfightTier; break;
          case 'uhc': playerTierValue = player.uhcTier; break;
          case 'nodebuff': playerTierValue = player.nodebuffTier; break;
          case 'bedfight': playerTierValue = player.bedfightTier; break;
          default: return false;
        }
        
        // Check if player's tier for this specific game mode matches the allowed tiers
        if (!allowedTiers.includes(playerTierValue)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.log('Error validating player orders:', error);
      return false;
    }
  }
}

// DbStorage temporarily removed to avoid db import issues
/*
    if (existingPlayers.length > 0) {
      return; // Data already exists, no need to seed
    }

    // Seed initial data
    const initialPlayers: Omit<Player, 'id'>[] = [
      // S Tier Players
      {
        name: "D3j4411",

        skywarsTier: "HT1",
        midfightTier: "HT1",
        uhcTier: "HT2",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      {
        name: "Velfair",

        skywarsTier: "HT1",
        midfightTier: "HT2",
        uhcTier: "HT1",
        nodebuffTier: "HT3",
        bedfightTier: "NR"
      },
      {
        name: "DR0IDv",

        skywarsTier: "HT1",
        midfightTier: "NR",
        uhcTier: "HT2",
        nodebuffTier: "HT1",
        bedfightTier: "HT3"
      },
      {
        name: "Torqueyckpio",

        skywarsTier: "MIDT1",
        midfightTier: "HT2",
        uhcTier: "HT3",
        nodebuffTier: "NR",
        bedfightTier: "LT1"
      },
      {
        name: "RivaV0cals",

        skywarsTier: "HT1",
        midfightTier: "HT3",
        uhcTier: "HT2",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      // A Tier Players  
      {
        name: "ItzAaronHi",

        skywarsTier: "HT2",
        midfightTier: "MIDT2",
        uhcTier: "LT1",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      {
        name: "zAmqni",

        skywarsTier: "HT2",
        midfightTier: "NR",
        uhcTier: "MIDT1",
        nodebuffTier: "HT3",
        bedfightTier: "NR"
      },
      {
        name: "Mikeyandroid",
 
        skywarsTier: "MIDT2",
        midfightTier: "HT3",
        uhcTier: "LT2",
        nodebuffTier: "NR",
        bedfightTier: "LT1"
      },
      // B Tier Players
      {
        name: "EletricHayden",

        skywarsTier: "HT3",
        midfightTier: "MIDT3",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      {
        name: "FlamePvPs",

        skywarsTier: "MIDT3",
        midfightTier: "LT2",
        uhcTier: "LT3",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      // C Tier Players
      {
        name: "ComicBiscuit778",

        skywarsTier: "LT1",
        midfightTier: "LT4",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      {
        name: "EfrazBR",

        skywarsTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "LT1",
        bedfightTier: "LT3"
      }
    ];

    // Insert initial players
    for (const playerData of initialPlayers) {
      await db.insert(players).values(playerData);
    }
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const result = await db.select().from(players).where(eq(players.id, id));
    return result[0];
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    const result = await db.select().from(players).where(eq(players.name, name));
    return result[0];
  }

  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const playerData = {
      ...insertPlayer,
      skywarsTier: insertPlayer.skywarsTier || "NR",
      midfightTier: insertPlayer.midfightTier || "NR",
      uhcTier: insertPlayer.uhcTier || "NR",
      nodebuffTier: insertPlayer.nodebuffTier || "NR",
      bedfightTier: insertPlayer.bedfightTier || "NR"
    };
    
    const result = await db.insert(players).values(playerData).returning();
    return result[0];
  }

  async updatePlayer(id: string, updateData: Partial<InsertPlayer>): Promise<Player> {
    const result = await db.update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("Player not found");
    }
    
    return result[0];
  }

  async deletePlayer(id: string): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.id, id)).returning();
    
    if (result.length > 0) {
      // Remove from all tier orders
      for (const [tierKey, orders] of Array.from(this.tierOrders.entries())) {
        const newOrders = orders.filter((playerId: string) => playerId !== id);
        if (newOrders.length !== orders.length) {
          this.tierOrders.set(tierKey, newOrders);
          // Persist to database
          await db.execute(sql`
            INSERT INTO tier_orders (tier_key, player_orders) 
            VALUES (${tierKey}, ${JSON.stringify(newOrders)})
            ON CONFLICT (tier_key) 
            DO UPDATE SET player_orders = EXCLUDED.player_orders
          `);
        }
      }
    }
    
    return result.length > 0;
  }

  // New versioned tier order methods
  private createTierKey(gameMode: GameModeForReorder, tier: TierLetter): string {
    return `${gameMode}:${tier}`;
  }

  private async withMutex<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Wait for any existing operation on this key to complete
    const existingMutex = this.tierMutexes.get(key);
    if (existingMutex) {
      await existingMutex;
    }

    // Create new mutex for this operation
    const mutex = fn();
    this.tierMutexes.set(key, mutex);
    
    try {
      const result = await mutex;
      return result;
    } finally {
      // Clean up the mutex
      this.tierMutexes.delete(key);
    }
  }

  async getTierOrder(gameMode: GameModeForReorder, tier: TierLetter): Promise<ReorderResponse> {
    const key = this.createTierKey(gameMode, tier);
    
    // Check memory cache first
    if (this.tierOrders.has(key)) {
      const playerIds = this.tierOrders.get(key) || [];
      const version = this.tierVersions.get(key) || 0;
      return { gameMode, tier, playerIds, version };
    }

    // Load from database
    try {
      const result = await db.execute(sql`
        SELECT player_orders, version FROM tier_orders WHERE tier_key = ${key}
      `);
      
      if (result.rows.length > 0) {
        const playerIds = JSON.parse(result.rows[0].player_orders as string);
        const version = Number(result.rows[0].version) || 0;
        
        // Update cache
        this.tierOrders.set(key, playerIds);
        this.tierVersions.set(key, version);
        
        return { gameMode, tier, playerIds, version };
      }
    } catch (error) {
      console.log('Error loading tier orders:', error);
    }

    // Return empty order with version 0
    return { gameMode, tier, playerIds: [], version: 0 };
  }

  async setTierOrder(gameMode: GameModeForReorder, tier: TierLetter, playerIds: string[], expectedVersion?: number): Promise<ReorderResponse> {
    const key = this.createTierKey(gameMode, tier);
    
    return this.withMutex(key, async () => {
      // Get current version from database
      let currentVersion = 0;
      try {
        const result = await db.execute(sql`
          SELECT version FROM tier_orders WHERE tier_key = ${key}
        `);
        if (result.rows.length > 0) {
          currentVersion = Number(result.rows[0].version) || 0;
        }
      } catch (error) {
        console.log('Error getting current version:', error);
      }
      
      // Check version conflict
      if (expectedVersion !== undefined && expectedVersion < currentVersion) {
        throw new Error(`Version conflict: expected ${expectedVersion}, current ${currentVersion}`);
      }
      
      // Validate the order
      const isValid = await this.validateTierOrder(gameMode, tier, playerIds);
      if (!isValid) {
        throw new Error("Invalid player order for tier");
      }
      
      // Update order and increment version
      const newVersion = currentVersion + 1;
      
      try {
        // Save to database with new version
        await db.execute(sql`
          INSERT INTO tier_orders (tier_key, player_orders, version) 
          VALUES (${key}, ${JSON.stringify(playerIds)}, ${newVersion})
          ON CONFLICT (tier_key) 
          DO UPDATE SET player_orders = EXCLUDED.player_orders, version = EXCLUDED.version
        `);

        // Update memory cache
        this.tierOrders.set(key, playerIds);
        this.tierVersions.set(key, newVersion);
        
        return { gameMode, tier, playerIds, version: newVersion };
      } catch (error) {
        console.log('Error saving tier orders:', error);
        throw new Error("Failed to save tier order");
      }
    });
  }

  async validateTierOrder(gameMode: GameModeForReorder, tier: TierLetter, playerIds: string[]): Promise<boolean> {
    // Check for duplicates
    if (new Set(playerIds).size !== playerIds.length) {
      return false;
    }

    // Map tier letters to their tier values
    const tierMapping: Record<TierLetter, string[]> = {
      'S': ['HT1', 'MIDT1', 'LT1'],
      'A': ['HT2', 'MIDT2', 'LT2'],
      'B': ['HT3', 'MIDT3', 'LT3'],
      'C': ['HT4', 'MIDT4', 'LT4'],
      'D': ['HT5', 'MIDT5', 'LT5']
    };

    const allowedTiers = tierMapping[tier];
    if (!allowedTiers) {
      return false;
    }

    // Validate all player IDs exist and belong to the correct tier
    try {
      for (const playerId of playerIds) {
        const result = await db.select().from(players).where(eq(players.id, playerId));
        if (result.length === 0) {
          return false;
        }
        
        const player = result[0];
        
        // Get the specific tier for this game mode
        let playerTierValue: string;
        switch (gameMode) {
          case 'skywars': playerTierValue = player.skywarsTier; break;
          case 'midfight': playerTierValue = player.midfightTier; break;
          case 'uhc': playerTierValue = player.uhcTier; break;
          case 'nodebuff': playerTierValue = player.nodebuffTier; break;
          case 'bedfight': playerTierValue = player.bedfightTier; break;
          default: return false;
        }
        
        // Check if player's tier for this game mode matches the allowed tiers
        if (!allowedTiers.includes(playerTierValue)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.log('Error validating tier order:', error);
      return false;
    }
  }

  // Legacy methods (deprecated)
  async getTierOrderLegacy(tierKey: string): Promise<string[]> {
    // Check memory cache first
    if (this.tierOrders.has(tierKey)) {
      return this.tierOrders.get(tierKey) || [];
    }

    // Load from database
    try {
      const result = await db.execute(sql`
        SELECT player_orders FROM tier_orders WHERE tier_key = ${tierKey}
      `);
      
      if (result.rows.length > 0) {
        const orders = JSON.parse(result.rows[0].player_orders as string);
        this.tierOrders.set(tierKey, orders);
        return orders;
      }
    } catch (error) {
      console.log('Error loading tier orders:', error);
    }

    return [];
  }

  async setTierOrderLegacy(tierKey: string, playerOrders: string[]): Promise<boolean> {
    // Validate that all players exist
    const isValid = await this.validatePlayerOrders(tierKey, playerOrders);
    if (!isValid) {
      throw new Error("Invalid player orders for tier");
    }

    try {
      // Save to database
      await db.execute(sql`
        INSERT INTO tier_orders (tier_key, player_orders) 
        VALUES (${tierKey}, ${JSON.stringify(playerOrders)})
        ON CONFLICT (tier_key) 
        DO UPDATE SET player_orders = EXCLUDED.player_orders
      `);

      // Update memory cache
      this.tierOrders.set(tierKey, playerOrders);
      return true;
    } catch (error) {
      console.log('Error saving tier orders:', error);
      throw new Error("Failed to save tier order");
    }
  }

  async validatePlayerOrders(tierKey: string, playerOrders: string[]): Promise<boolean> {
    // Check for duplicates
    if (new Set(playerOrders).size !== playerOrders.length) {
      return false;
    }

    // Extract tier name from full tierKey format (e.g., "skywars-S Tier" -> "S Tier")
    const tierName = tierKey.includes('-') ? tierKey.split('-')[1] : tierKey;

    // Map tier keys to their tier values
    const tierMapping: Record<string, string[]> = {
      'S Tier': ['HT1', 'MIDT1', 'LT1'],
      'A Tier': ['HT2', 'MIDT2', 'LT2'],
      'B Tier': ['HT3', 'MIDT3', 'LT3'], 
      'C Tier': ['HT4', 'MIDT4', 'LT4'],
      'D Tier': ['HT5', 'MIDT5', 'LT5']
    };

    const allowedTiers = tierMapping[tierName];
    if (!allowedTiers) {
      return false;
    }

    // Validate all player IDs exist in database and belong to correct tier
    try {
      for (const playerId of playerOrders) {
        const result = await db.select().from(players).where(eq(players.id, playerId));
        if (result.length === 0) {
          return false;
        }
        
        const player = result[0];
        const playerTiers = [player.skywarsTier, player.midfightTier, player.uhcTier, player.nodebuffTier, player.bedfightTier];
        const hasMatchingTier = playerTiers.some(tier => allowedTiers.includes(tier));
        
        if (!hasMatchingTier) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.log('Error validating player orders:', error);
      return false;
    }
  }
}
*/

export const storage = new DatabaseStorage();

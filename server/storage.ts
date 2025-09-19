import { type Player, type InsertPlayer, players } from "@shared/schema";
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
  getTierOrder(tierKey: string): Promise<string[]>;
  setTierOrder(tierKey: string, playerOrders: string[]): Promise<boolean>;
  validatePlayerOrders(tierKey: string, playerOrders: string[]): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private players: Map<string, Player>;
  private tierOrders: Map<string, string[]>;

  constructor() {
    this.players = new Map();
    this.tierOrders = new Map();
    this.seedInitialData();
  }

  private seedInitialData() {
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

    initialPlayers.forEach(player => {
      const id = randomUUID();
      this.players.set(id, { ...player, id });
    });
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values()).sort((a, b) => {
      // Sort by tier ranking (approximate based on tier levels)
      const getTierValue = (tier: string): number => {
        switch (tier) {
          case "HT1": return 100;
          case "LT1": return 90;
          case "HT2": return 80;
          case "LT2": return 70;
          case "HT3": return 60;
          case "LT3": return 50;
          case "LT4": return 40;
          case "LT5": return 30;
          default: return 0;
        }
      };

      const aScore = getTierValue(a.skywarsTier) + getTierValue(a.midfightTier) + getTierValue(a.uhcTier) + getTierValue(a.nodebuffTier) + getTierValue(a.bedfightTier);
      const bScore = getTierValue(b.skywarsTier) + getTierValue(b.midfightTier) + getTierValue(b.uhcTier) + getTierValue(b.nodebuffTier) + getTierValue(b.bedfightTier);
      
      return bScore - aScore;
    });
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { 
      ...insertPlayer, 
      id,
      skywarsTier: insertPlayer.skywarsTier || "NR",
      midfightTier: insertPlayer.midfightTier || "NR",
      uhcTier: insertPlayer.uhcTier || "NR",
      nodebuffTier: insertPlayer.nodebuffTier || "NR",
      bedfightTier: insertPlayer.bedfightTier || "NR"
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, updateData: Partial<InsertPlayer>): Promise<Player> {
    const existingPlayer = this.players.get(id);
    if (!existingPlayer) {
      throw new Error("Player not found");
    }
    
    const updatedPlayer: Player = { ...existingPlayer, ...updateData };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const deleted = this.players.delete(id);
    if (deleted) {
      // Remove from all tier orders
      for (const [tierKey, orders] of Array.from(this.tierOrders.entries())) {
        const newOrders = orders.filter((playerId: string) => playerId !== id);
        if (newOrders.length !== orders.length) {
          this.tierOrders.set(tierKey, newOrders);
        }
      }
    }
    return deleted;
  }

  async getTierOrder(tierKey: string): Promise<string[]> {
    return this.tierOrders.get(tierKey) || [];
  }

  async setTierOrder(tierKey: string, playerOrders: string[]): Promise<boolean> {
    // Validate that all players exist and belong to the specified tier
    const isValid = await this.validatePlayerOrders(tierKey, playerOrders);
    if (!isValid) {
      throw new Error("Invalid player orders for tier");
    }
    
    this.tierOrders.set(tierKey, playerOrders);
    return true;
  }

  async validatePlayerOrders(tierKey: string, playerOrders: string[]): Promise<boolean> {
    // Check for duplicates
    if (new Set(playerOrders).size !== playerOrders.length) {
      return false;
    }

    // Validate all player IDs exist
    for (const playerId of playerOrders) {
      const player = this.players.get(playerId);
      if (!player) {
        return false;
      }
    }

    return true;
  }
}

export class DbStorage implements IStorage {
  private tierOrders: Map<string, string[]>;

  constructor() {
    this.tierOrders = new Map();
    this.createTableIfNotExists().then(() => {
      this.initializeData();
    });
  }

  private async createTableIfNotExists() {
    try {
      // Try to create tables if they don't exist
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS players (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          skywars_tier TEXT NOT NULL DEFAULT 'NR',
          midfight_tier TEXT NOT NULL DEFAULT 'NR',
          uhc_tier TEXT NOT NULL DEFAULT 'NR',
          nodebuff_tier TEXT NOT NULL DEFAULT 'NR',
          bedfight_tier TEXT NOT NULL DEFAULT 'NR'
        )
      `);
      
      // Create tier_orders table for storing custom player orders
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS tier_orders (
          tier_key VARCHAR PRIMARY KEY,
          player_orders TEXT NOT NULL DEFAULT '[]'
        )
      `);
      
      console.log('Tables created or already exist');
    } catch (error) {
      console.log('Table creation error (probably already exists):', error);
    }
  }

  private async initializeData() {
    // Check if players already exist in the database
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

  async getTierOrder(tierKey: string): Promise<string[]> {
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

  async setTierOrder(tierKey: string, playerOrders: string[]): Promise<boolean> {
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

    // Validate all player IDs exist in database
    try {
      for (const playerId of playerOrders) {
        const result = await db.select().from(players).where(eq(players.id, playerId));
        if (result.length === 0) {
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

export const storage = new DbStorage();

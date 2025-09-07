import { type Player, type InsertPlayer, players } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByName(name: string): Promise<Player | undefined>;
  getAllPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player>;
  deletePlayer(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private players: Map<string, Player>;

  constructor() {
    this.players = new Map();
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
    return this.players.delete(id);
  }
}

export class DbStorage implements IStorage {
  constructor() {
    this.initializeData();
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
    return result.length > 0;
  }
}

export const storage = new DbStorage();

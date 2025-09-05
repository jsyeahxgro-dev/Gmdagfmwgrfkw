import { type Player, type InsertPlayer } from "@shared/schema";
import { randomUUID } from "crypto";

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
        title: "Combat Grandmaster",
        bridgeTier: "NR",
        skywarsTier: "HT1",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      {
        name: "Velfair",
        title: "Combat Grandmaster",
        bridgeTier: "NR",
        skywarsTier: "HT1",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      {
        name: "DR0IDv",
        title: "Combat Grandmaster",
        bridgeTier: "NR",
        skywarsTier: "HT1",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      {
        name: "Torqueyckpio",
        title: "Combat Grandmaster",
        bridgeTier: "NR",
        skywarsTier: "HT1",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      {
        name: "RivaV0cals",
        title: "Combat Grandmaster",
        bridgeTier: "NR",
        skywarsTier: "HT1",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      // A Tier Players  
      {
        name: "ItzAaronHi",
        title: "Combat Master",
        bridgeTier: "NR",
        skywarsTier: "HT2",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      {
        name: "zAmqni",
        title: "Combat Master",
        bridgeTier: "NR",
        skywarsTier: "HT2",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      {
        name: "Mikeyandroid",
        title: "Combat Master", 
        bridgeTier: "NR",
        skywarsTier: "HT2",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      // B Tier Players
      {
        name: "EletricHayden",
        title: "Combat Ace",
        bridgeTier: "NR",
        skywarsTier: "HT3",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      {
        name: "FlamePvPs",
        title: "Combat Ace",
        bridgeTier: "NR",
        skywarsTier: "HT3",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      // C Tier Players
      {
        name: "ComicBiscuit778",
        title: "Combat Specialist",
        bridgeTier: "NR",
        skywarsTier: "LT1",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "NR",
        isRetired: false
      },
      {
        name: "EfrazBR",
        title: "Combat Ace",
        bridgeTier: "NR",
        skywarsTier: "NR",
        crystalTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
        sumoTier: "LT1",
        isRetired: false
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

      const aScore = getTierValue(a.crystalTier) + getTierValue(a.uhcTier) + getTierValue(a.bedfightTier);
      const bScore = getTierValue(b.crystalTier) + getTierValue(b.uhcTier) + getTierValue(b.bedfightTier);
      
      return bScore - aScore;
    });
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { 
      ...insertPlayer, 
      id,
      bridgeTier: insertPlayer.bridgeTier || "NR",
      skywarsTier: insertPlayer.skywarsTier || "NR",
      crystalTier: insertPlayer.crystalTier || "NR",
      midfightTier: insertPlayer.midfightTier || "NR",
      uhcTier: insertPlayer.uhcTier || "NR",
      nodebuffTier: insertPlayer.nodebuffTier || "NR",
      bedfightTier: insertPlayer.bedfightTier || "NR",
      sumoTier: insertPlayer.sumoTier || "NR",
      isRetired: false
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

export const storage = new MemStorage();

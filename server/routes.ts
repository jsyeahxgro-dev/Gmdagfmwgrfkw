import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, reorderSchema, adminAuthSchema, type InsertPlayer, type ReorderData } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all players
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  // Get player by ID
  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  // Create new player or update existing player tier
  app.post("/api/players", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      
      // Check if player name already exists
      const existingPlayer = await storage.getPlayerByName(validatedData.name);
      if (existingPlayer) {
        // Only update non-NR tiers to preserve existing player data
        const updateData: Partial<typeof validatedData> = {
          name: validatedData.name
        };
        
        // Only add tier fields that are not "NR" to preserve existing tiers
        if (validatedData.skywarsTier && validatedData.skywarsTier !== "NR") {
          updateData.skywarsTier = validatedData.skywarsTier;
        }
        if (validatedData.midfightTier && validatedData.midfightTier !== "NR") {
          updateData.midfightTier = validatedData.midfightTier;
        }
        if (validatedData.uhcTier && validatedData.uhcTier !== "NR") {
          updateData.uhcTier = validatedData.uhcTier;
        }
        if (validatedData.nodebuffTier && validatedData.nodebuffTier !== "NR") {
          updateData.nodebuffTier = validatedData.nodebuffTier;
        }
        if (validatedData.bedfightTier && validatedData.bedfightTier !== "NR") {
          updateData.bedfightTier = validatedData.bedfightTier;
        }
        
        const updatedPlayer = await storage.updatePlayer(existingPlayer.id, updateData);
        return res.status(200).json(updatedPlayer);
      }

      const player = await storage.createPlayer(validatedData);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid player data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create/update player" });
    }
  });

  // Update player
  app.patch("/api/players/:id", async (req, res) => {
    try {
      const updateData = insertPlayerSchema.partial().parse(req.body);
      const player = await storage.updatePlayer(req.params.id, updateData);
      res.json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid player data", details: error.errors });
      }
      if (error instanceof Error && error.message === "Player not found") {
        return res.status(404).json({ error: "Player not found" });
      }
      res.status(500).json({ error: "Failed to update player" });
    }
  });

  // Delete player
  app.delete("/api/players/:id", async (req, res) => {
    try {
      const success = await storage.deletePlayer(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete player" });
    }
  });

  // Reorder player tier
  app.patch("/api/players/:id/tier", async (req, res) => {
    try {
      const { gameMode, tier } = req.body;
      if (!gameMode || !tier) {
        return res.status(400).json({ error: "gameMode and tier are required" });
      }

      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      // Update the specific game mode tier
      const updateData: Partial<InsertPlayer> = {};
      const gameModeField = `${gameMode}Tier` as keyof typeof updateData;
      (updateData as any)[gameModeField] = tier;

      const updatedPlayer = await storage.updatePlayer(req.params.id, updateData);
      res.json(updatedPlayer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update player tier" });
    }
  });

  // Reorder players within a tier
  app.post("/api/players/reorder", async (req, res) => {
    try {
      const validatedData = reorderSchema.parse(req.body);
      const { tierKey, playerOrders } = validatedData;
      
      // Save the tier order using storage
      await storage.setTierOrder(tierKey, playerOrders);
      
      res.json({ success: true, tierKey, playerOrders });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid reorder data", details: error.errors });
      }
      if (error instanceof Error && error.message === "Invalid player orders for tier") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to reorder players" });
    }
  });

  // Get tier order
  app.get("/api/players/tier-order/:tierKey", async (req, res) => {
    try {
      const { tierKey } = req.params;
      const playerOrders = await storage.getTierOrder(tierKey);
      res.json({ tierKey, playerOrders });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tier order" });
    }
  });

  // Admin authentication
  app.post("/api/admin/auth", (req, res) => {
    const { password } = req.body;
    if (password === "admin123") {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, legacyReorderSchema, adminAuthSchema, type InsertPlayer, type LegacyReorderData } from "@shared/schema";
import { z } from "zod";

// Simple in-memory session store (in production, use Redis or database)
const adminSessions = new Set<string>();

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !adminSessions.has(sessionId)) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
}

// Generate simple session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Comprehensive cache system
  interface CacheEntry {
    data: any;
    timestamp: number;
  }
  
  const cache = new Map<string, CacheEntry>();
  const CACHE_DURATION = 30000; // 30 seconds cache
  
  // Cache utility functions
  function getCacheKey(endpoint: string, params?: string): string {
    return params ? `${endpoint}:${params}` : endpoint;
  }
  
  function getCachedData(key: string): any | null {
    const entry = cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
      cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  function setCachedData(key: string, data: any): void {
    cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }
  
  function invalidateCache(pattern?: string): void {
    if (!pattern) {
      // Clear all cache
      cache.clear();
      return;
    }
    
    // Clear cache entries matching pattern
    for (const key of cache.keys()) {
      if (key.startsWith(pattern)) {
        cache.delete(key);
      }
    }
  }

  // Get all players with caching
  app.get("/api/players", async (req, res) => {
    try {
      const cacheKey = getCacheKey("/api/players");
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      // Cache miss or expired - fetch from database
      const players = await storage.getAllPlayers();
      setCachedData(cacheKey, players);
      
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  // Get player by ID with caching
  app.get("/api/players/:id", async (req, res) => {
    try {
      const cacheKey = getCacheKey("/api/players", req.params.id);
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      setCachedData(cacheKey, player);
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  // Create new player or update existing player tier
  app.post("/api/players", requireAuth, async (req, res) => {
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
        
        // Invalidate relevant cache entries
        invalidateCache("/api/players");
        
        return res.status(200).json(updatedPlayer);
      }

      const player = await storage.createPlayer(validatedData);
      
      // Invalidate relevant cache entries
      invalidateCache("/api/players");
      
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid player data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create/update player" });
    }
  });

  // Update player
  app.patch("/api/players/:id", requireAuth, async (req, res) => {
    try {
      const updateData = insertPlayerSchema.partial().parse(req.body);
      const player = await storage.updatePlayer(req.params.id, updateData);
      
      // Invalidate relevant cache entries
      invalidateCache("/api/players");
      
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
  app.delete("/api/players/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deletePlayer(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Invalidate relevant cache entries
      invalidateCache("/api/players");
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete player" });
    }
  });

  // Reorder player tier
  app.patch("/api/players/:id/tier", requireAuth, async (req, res) => {
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
      
      // Invalidate relevant cache entries
      invalidateCache("/api/players");
      
      res.json(updatedPlayer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update player tier" });
    }
  });

  // Reorder players within a tier
  app.post("/api/players/reorder", requireAuth, async (req, res) => {
    try {
      const validatedData = legacyReorderSchema.parse(req.body);
      const { tierKey, playerOrders } = validatedData;
      
      // Save the tier order using storage (legacy method)
      await storage.setTierOrderLegacy(tierKey, playerOrders);
      
      // Invalidate relevant cache entries
      invalidateCache("/api/players/tier-order");
      
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

  // Get tier order with caching
  app.get("/api/players/tier-order/:tierKey", async (req, res) => {
    try {
      const { tierKey } = req.params;
      const cacheKey = getCacheKey("/api/players/tier-order", tierKey);
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const playerOrders = await storage.getTierOrderLegacy(tierKey);
      const responseData = { tierKey, playerOrders };
      setCachedData(cacheKey, responseData);
      res.json(responseData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tier order" });
    }
  });

  // Admin authentication
  app.post("/api/admin/auth", (req, res) => {
    try {
      const validatedData = adminAuthSchema.parse(req.body);
      const { password } = validatedData;
      
      // Use environment variable only - no hardcoded fallback for security
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        console.error("ADMIN_PASSWORD environment variable is not set");
        return res.status(500).json({ error: "Server configuration error" });
      }
      
      if (password === adminPassword) {
        const sessionToken = generateSessionToken();
        adminSessions.add(sessionToken);
        
        // Set token to expire after 1 hour
        setTimeout(() => {
          adminSessions.delete(sessionToken);
        }, 60 * 60 * 1000);
        
        res.json({ success: true, token: sessionToken });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid auth data", details: error.errors });
      }
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

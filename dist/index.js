// server/index.ts
import express2 from "express";
import path3 from "path";
import { fileURLToPath } from "url";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  players;
  constructor() {
    this.players = /* @__PURE__ */ new Map();
    this.seedInitialData();
  }
  seedInitialData() {
    const initialPlayers = [
      // S Tier Players
      {
        name: "D3j4411",
        title: "Combat Grandmaster",
        skywarsTier: "HT1",
        midfightTier: "HT1",
        uhcTier: "HT2",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      {
        name: "Velfair",
        title: "Combat Grandmaster",
        skywarsTier: "HT1",
        midfightTier: "HT2",
        uhcTier: "HT1",
        nodebuffTier: "HT3",
        bedfightTier: "NR"
      },
      {
        name: "DR0IDv",
        title: "Combat Master",
        skywarsTier: "HT1",
        midfightTier: "NR",
        uhcTier: "HT2",
        nodebuffTier: "HT1",
        bedfightTier: "HT3"
      },
      {
        name: "Torqueyckpio",
        title: "Combat Ace",
        skywarsTier: "MIDT1",
        midfightTier: "HT2",
        uhcTier: "HT3",
        nodebuffTier: "NR",
        bedfightTier: "LT1"
      },
      {
        name: "RivaV0cals",
        title: "Combat Master",
        skywarsTier: "HT1",
        midfightTier: "HT3",
        uhcTier: "HT2",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      // A Tier Players  
      {
        name: "ItzAaronHi",
        title: "Combat Ace",
        skywarsTier: "HT2",
        midfightTier: "MIDT2",
        uhcTier: "LT1",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      {
        name: "zAmqni",
        title: "Combat Elite",
        skywarsTier: "HT2",
        midfightTier: "NR",
        uhcTier: "MIDT1",
        nodebuffTier: "HT3",
        bedfightTier: "NR"
      },
      {
        name: "Mikeyandroid",
        title: "Combat Specialist",
        skywarsTier: "MIDT2",
        midfightTier: "HT3",
        uhcTier: "LT2",
        nodebuffTier: "NR",
        bedfightTier: "LT1"
      },
      // B Tier Players
      {
        name: "EletricHayden",
        title: "Combat Specialist",
        skywarsTier: "HT3",
        midfightTier: "MIDT3",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      {
        name: "FlamePvPs",
        title: "Combat Cadet",
        skywarsTier: "MIDT3",
        midfightTier: "LT2",
        uhcTier: "LT3",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      // C Tier Players
      {
        name: "ComicBiscuit778",
        title: "Combat Cadet",
        skywarsTier: "LT1",
        midfightTier: "LT4",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR"
      },
      {
        name: "EfrazBR",
        title: "Combat Novice",
        skywarsTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "LT1",
        bedfightTier: "LT3"
      }
    ];
    initialPlayers.forEach((player) => {
      const id = randomUUID();
      this.players.set(id, { ...player, id });
    });
  }
  async getPlayer(id) {
    return this.players.get(id);
  }
  async getPlayerByName(name) {
    return Array.from(this.players.values()).find(
      (player) => player.name.toLowerCase() === name.toLowerCase()
    );
  }
  async getAllPlayers() {
    return Array.from(this.players.values()).sort((a, b) => {
      const getTierValue = (tier) => {
        switch (tier) {
          case "HT1":
            return 100;
          case "LT1":
            return 90;
          case "HT2":
            return 80;
          case "LT2":
            return 70;
          case "HT3":
            return 60;
          case "LT3":
            return 50;
          case "LT4":
            return 40;
          case "LT5":
            return 30;
          default:
            return 0;
        }
      };
      const aScore = getTierValue(a.skywarsTier) + getTierValue(a.midfightTier) + getTierValue(a.uhcTier) + getTierValue(a.nodebuffTier) + getTierValue(a.bedfightTier);
      const bScore = getTierValue(b.skywarsTier) + getTierValue(b.midfightTier) + getTierValue(b.uhcTier) + getTierValue(b.nodebuffTier) + getTierValue(b.bedfightTier);
      return bScore - aScore;
    });
  }
  async createPlayer(insertPlayer) {
    const id = randomUUID();
    const player = {
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
  async updatePlayer(id, updateData) {
    const existingPlayer = this.players.get(id);
    if (!existingPlayer) {
      throw new Error("Player not found");
    }
    const updatedPlayer = { ...existingPlayer, ...updateData };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  async deletePlayer(id) {
    return this.players.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  skywarsTier: text("skywars_tier").notNull().default("NR"),
  midfightTier: text("midfight_tier").notNull().default("NR"),
  uhcTier: text("uhc_tier").notNull().default("NR"),
  nodebuffTier: text("nodebuff_tier").notNull().default("NR"),
  bedfightTier: text("bedfight_tier").notNull().default("NR")
});
var insertPlayerSchema = createInsertSchema(players).omit({
  id: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/players", async (req, res) => {
    try {
      const players2 = await storage.getAllPlayers();
      res.json(players2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });
  app2.get("/api/players/:id", async (req, res) => {
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
  app2.post("/api/players", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const existingPlayer = await storage.getPlayerByName(validatedData.name);
      if (existingPlayer) {
        return res.status(400).json({ error: "Player with this name already exists" });
      }
      const player = await storage.createPlayer(validatedData);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid player data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create player" });
    }
  });
  app2.patch("/api/players/:id", async (req, res) => {
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
  app2.delete("/api/players/:id", async (req, res) => {
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
  app2.post("/api/admin/auth", (req, res) => {
    const { password } = req.body;
    if (password === "admin123") {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const pathName = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathName.startsWith("/api")) {
      let logLine = `${req.method} ${pathName} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path3.dirname(__filename);
    app.use(express2.static(path3.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path3.join(__dirname, "dist", "index.html"));
    });
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();

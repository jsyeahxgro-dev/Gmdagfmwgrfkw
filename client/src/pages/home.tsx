import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TierList } from "@/components/tier-list";
import { Shield, Trophy, Users, Activity } from "lucide-react";
import type { Player } from "@shared/schema";
import mmcLogo from "@assets/a_dbfce8f408139faef5fd4fd4345def4b_1757091303032.gif";

export default function Home() {
  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const activePlayers = players;

  const sTierPlayers = activePlayers.filter(player => 
    player.skywarsTier === "HT1" || player.skywarsTier === "LT1" ||
    player.midfightTier === "HT1" || player.midfightTier === "LT1" ||
    player.uhcTier === "HT1" || player.uhcTier === "LT1" ||
    player.nodebuffTier === "HT1" || player.nodebuffTier === "LT1" ||
    player.bedfightTier === "HT1" || player.bedfightTier === "LT1"
  ).length;

  return (
    <div className="min-h-screen minecraft-bg text-foreground">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-primary/20 shadow-lg overflow-hidden">
                <img 
                  src={mmcLogo} 
                  alt="MMC Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight minecraft-title">MMC</h1>
                <p className="text-muted-foreground text-sm">Official Minecraft Mobile Community Rankings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://youtube.com/", "_blank")}
                className="bg-red-600/20 hover:bg-red-600/30 border-red-600/50 text-red-400 hover:text-red-300"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://discord.gg/k3VjHfxBTM", "_blank")}
                className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-600/50 text-blue-400 hover:text-blue-300"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card/30 backdrop-blur-sm border-border/50" data-testid="stats-total-players">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{activePlayers.length}</div>
                  <div className="text-muted-foreground text-sm">Total Players</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/30 backdrop-blur-sm border-border/50" data-testid="stats-s-tier-players">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-xl font-bold text-yellow-500">{sTierPlayers}</div>
                  <div className="text-muted-foreground text-sm">T1 Players</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/30 backdrop-blur-sm border-border/50" data-testid="stats-game-modes">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-secondary">5</div>
                  <div className="text-muted-foreground text-sm">Game Modes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/30 backdrop-blur-sm border-border/50" data-testid="stats-ranking-status">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="text-xl font-bold text-green-500">Live</div>
                  <div className="text-muted-foreground text-sm">Rankings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier List */}
        <TierList players={activePlayers} isLoading={isLoading} />
      </main>
    </div>
  );
}

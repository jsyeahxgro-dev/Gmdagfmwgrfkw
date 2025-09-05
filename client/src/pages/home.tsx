import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TierList } from "@/components/tier-list";
import { Shield, Trophy, Users, Activity } from "lucide-react";
import type { Player } from "@shared/schema";

export default function Home() {
  const [showRetired, setShowRetired] = useState(false);

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const activePlayers = players.filter(player => !player.isRetired);
  const displayPlayers = showRetired ? players : activePlayers;

  const sTierPlayers = activePlayers.filter(player => 
    player.crystalTier === "HT1" || player.crystalTier === "LT1" ||
    player.uhcTier === "HT1" || player.uhcTier === "LT1" ||
    player.bedfightTier === "HT1" || player.bedfightTier === "LT1"
  ).length;

  return (
    <div className="min-h-screen minecraft-bg text-foreground">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center border-2 border-primary/20 shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">MC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">MCBE TIERS</h1>
                <p className="text-muted-foreground text-sm">Official Minecraft Bedrock PvP Community Rankings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowRetired(!showRetired)}
                data-testid="toggle-retired-button"
                className="bg-card/50 hover:bg-card/80 backdrop-blur-sm"
              >
                {showRetired ? "Hide Retired" : "Show Retired"}
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
                  <div className="text-xl font-bold text-secondary">8</div>
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
        <TierList players={displayPlayers} isLoading={isLoading} />
      </main>
    </div>
  );
}

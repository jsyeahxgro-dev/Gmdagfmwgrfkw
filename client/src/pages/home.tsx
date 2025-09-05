import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerTable } from "@/components/player-table";
import { AdminPanel } from "@/components/admin-panel";
import { Shield, Trophy, Users, Activity } from "lucide-react";
import type { Player } from "@shared/schema";

export default function Home() {
  const [showRetired, setShowRetired] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">MB</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">MCBE TIERS</h1>
                <p className="text-muted-foreground text-sm">Official Minecraft Bedrock PvP Tier List</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => setShowRetired(!showRetired)}
                data-testid="toggle-retired-button"
              >
                {showRetired ? "Hide Retired Players" : "Show Retired Players"}
              </Button>
              <Button
                onClick={() => setShowAdminPanel(true)}
                data-testid="admin-button"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stats-total-players">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">{activePlayers.length}</div>
                  <div className="text-muted-foreground">Total Players</div>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card data-testid="stats-s-tier-players">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{sTierPlayers}</div>
                  <div className="text-muted-foreground">S Tier Players</div>
                </div>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card data-testid="stats-game-modes">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-secondary">8</div>
                  <div className="text-muted-foreground">Game Modes</div>
                </div>
                <Activity className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card data-testid="stats-ranking-status">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-accent">Live</div>
                  <div className="text-muted-foreground">Rankings Status</div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Legend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tier System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="tier-s">High S</Badge>
                <span className="text-muted-foreground text-sm">HT1</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="tier-a">High A</Badge>
                <span className="text-muted-foreground text-sm">HT2</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="tier-b">High B</Badge>
                <span className="text-muted-foreground text-sm">HT3</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="tier-s">Low S</Badge>
                <span className="text-muted-foreground text-sm">LT1</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="tier-a">Low A</Badge>
                <span className="text-muted-foreground text-sm">LT2</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="tier-b">Low C</Badge>
                <span className="text-muted-foreground text-sm">LT3</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="tier-c">C Tier</Badge>
                <span className="text-muted-foreground text-sm">LT4</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="tier-d">D Tier</Badge>
                <span className="text-muted-foreground text-sm">LT5</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="tier-nr">Not Ranked</Badge>
                <span className="text-muted-foreground text-sm">NR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Table */}
        <PlayerTable players={displayPlayers} isLoading={isLoading} />

        {/* Admin Panel */}
        {showAdminPanel && (
          <AdminPanel
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </main>
    </div>
  );
}

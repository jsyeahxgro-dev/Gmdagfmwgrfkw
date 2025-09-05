import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Settings } from "lucide-react";
import { PlayerCard } from "./player-card";
import { AdminPanel } from "./admin-panel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Player, GameMode } from "@shared/schema";
import { gameModes, tierLevels } from "@shared/schema";

interface TierListProps {
  players: Player[];
  isLoading: boolean;
}

export function TierList({ players, isLoading }: TierListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>("overall");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Player deleted",
        description: "Player has been successfully removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive",
      });
    },
  });

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierForGameMode = (player: Player, gameMode: GameMode): string => {
    switch (gameMode) {
      case "skywars": return player.skywarsTier;
      case "midfight": return player.midfightTier;
      case "bridge": return player.bridgeTier;
      case "crystal": return player.crystalTier;
      case "sumo": return player.sumoTier;
      case "nodebuff": return player.nodebuffTier;
      case "bedfight": return player.bedfightTier;
      case "uhc": return player.uhcTier;
      case "overall": 
        // For overall, use highest tier across all game modes
        const tiers = [
          player.skywarsTier, player.midfightTier, player.bridgeTier,
          player.crystalTier, player.sumoTier, player.nodebuffTier,
          player.bedfightTier, player.uhcTier
        ].filter(tier => tier !== "NR");
        
        if (tiers.length === 0) return "NR";
        
        // Return highest tier (HT1 > LT1 > HT2 > LT2 etc.)
        const tierOrder = ["HT1", "LT1", "HT2", "LT2", "HT3", "LT3", "LT4", "LT5"];
        for (const tier of tierOrder) {
          if (tiers.includes(tier)) return tier;
        }
        return "NR";
      default: return "NR";
    }
  };

  const getPlayersForTier = (tierKey: string) => {
    const tierLevel = tierLevels.find(t => t.key === tierKey);
    if (!tierLevel) return [];

    return filteredPlayers.filter(player => {
      const playerTier = getTierForGameMode(player, selectedGameMode);
      return (tierLevel.tiers as readonly string[]).includes(playerTier);
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Admin */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={isAdminMode ? "default" : "outline"}
            onClick={() => setIsAdminMode(!isAdminMode)}
            data-testid="toggle-admin-mode"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isAdminMode ? "Exit Admin" : "Admin Mode"}
          </Button>
          {isAdminMode && (
            <Button
              onClick={() => setShowAdminPanel(true)}
              data-testid="add-player-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          )}
        </div>
      </div>

      {/* Game Mode Tabs */}
      <Tabs value={selectedGameMode} onValueChange={(value) => setSelectedGameMode(value as GameMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 bg-card/50 backdrop-blur-sm">
          {gameModes.map((gameMode) => (
            <TabsTrigger
              key={gameMode.key}
              value={gameMode.key}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid={`gamemode-tab-${gameMode.key}`}
            >
              <span className="text-sm">{gameMode.icon}</span>
              <span className="hidden sm:inline">{gameMode.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {gameModes.map((gameMode) => (
          <TabsContent key={gameMode.key} value={gameMode.key} className="space-y-6">
            {/* Tier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tierLevels.map((tierLevel) => {
                const tieredPlayers = getPlayersForTier(tierLevel.key);
                return (
                  <Card 
                    key={tierLevel.key} 
                    className="min-h-[400px] bg-card/30 backdrop-blur-sm border-border/50"
                    data-testid={`tier-section-${tierLevel.key}`}
                  >
                    <CardHeader className="pb-3">
                      <div className={`text-center py-3 px-4 rounded-lg bg-gradient-to-r ${tierLevel.color}`}>
                        <h3 className={`font-bold text-lg ${tierLevel.textColor}`}>
                          {tierLevel.key}
                        </h3>
                        <p className={`text-sm ${tierLevel.textColor} opacity-90`}>
                          {tierLevel.name}
                        </p>
                        <p className={`text-xs ${tierLevel.textColor} opacity-75 mt-1`}>
                          Players: {tieredPlayers.length}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tieredPlayers.length > 0 ? (
                        tieredPlayers.map((player) => (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            isAdmin={isAdminMode}
                            onEdit={(player) => {
                              setEditingPlayer(player);
                              setShowAdminPanel(true);
                            }}
                            onDelete={(id) => deletePlayerMutation.mutate(id)}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No players in this tier</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel 
          onClose={() => {
            setShowAdminPanel(false);
            setEditingPlayer(null);
          }}
          editingPlayer={editingPlayer}
        />
      )}
    </div>
  );
}
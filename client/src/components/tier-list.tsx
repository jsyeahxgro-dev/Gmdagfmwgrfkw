import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Settings, Edit, Trash2 } from "lucide-react";
import { PlayerCard } from "./player-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminPanel } from "./admin-panel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Player, GameMode } from "@shared/schema";
import { gameModes, tierLevels, getTierColor } from "@shared/schema";

interface TierListProps {
  players: Player[];
  isLoading: boolean;
}

export function TierList({ players, isLoading }: TierListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>("overall");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Handle admin mode state from admin panel
  const handleAdminLogin = () => {
    setIsAdminMode(true);
  };
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
      case "nodebuff": return player.nodebuffTier;
      case "bedfight": return player.bedfightTier;
      case "uhc": return player.uhcTier;
      case "overall": 
        // For overall, use highest tier across all game modes
        const tiers = [
          player.skywarsTier, player.midfightTier, player.nodebuffTier,
          player.bedfightTier, player.uhcTier
        ].filter(tier => tier !== "NR");
        
        if (tiers.length === 0) return "NR";
        
        // Return highest tier (HT1 > MIDT1 > LT1 > HT2 > MIDT2 > LT2 etc.)
        const tierOrder = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5"];
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
            onClick={() => {
              if (!isAdminMode) {
                setShowAdminPanel(true);
              } else {
                setIsAdminMode(false);
              }
            }}
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-card/80 backdrop-blur-sm border border-border/50">
          {(gameModes as readonly any[]).map((gameMode: any) => (
            <TabsTrigger
              key={gameMode.key}
              value={gameMode.key}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-3"
              data-testid={`gamemode-tab-${gameMode.key}`}
            >
              <span className="text-sm">{gameMode.icon}</span>
              <span className="text-sm font-medium">{gameMode.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overall" className="space-y-6">
          {/* Overall Leaderboard */}
          <Card className="bg-card/30 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredPlayers
                  .sort((a, b) => {
                    const aHighest = getTierForGameMode(a, 'overall');
                    const bHighest = getTierForGameMode(b, 'overall');
                    const tierOrder = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5", "NR"];
                    return tierOrder.indexOf(aHighest) - tierOrder.indexOf(bHighest);
                  })
                  .map((player, index) => (
                    <div key={player.id} className={`flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 shimmer-gold' :
                      index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900/20 dark:to-gray-800/20 shimmer-silver' :
                      index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 shimmer-bronze' :
                      ''
                    }`} data-testid={`leaderboard-player-${player.id}`}>
                      {/* Ranking */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-orange-500 text-orange-900' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Player Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-12 h-12 border-2 border-border/30">
                          <AvatarImage 
                            src={`https://mc-heads.net/avatar/${player.name}/64`}
                            alt={`${player.name}'s skin`}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">{player.title}</p>
                        </div>
                      </div>
                      
                      {/* Tier Badges */}
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { key: 'skywars', tier: player.skywarsTier, abbr: 'SW' },
                          { key: 'midfight', tier: player.midfightTier, abbr: 'Midf' },
                          { key: 'nodebuff', tier: player.nodebuffTier, abbr: 'NoDb' },
                          { key: 'bedfight', tier: player.bedfightTier, abbr: 'Bed' },
                          { key: 'uhc', tier: player.uhcTier, abbr: 'UHC' }
                        ].map(mode => {
                          if (!mode.tier || mode.tier === 'NR') {
                            return (
                              <div key={mode.key} className="px-2 py-1 rounded bg-gray-500 text-xs font-bold text-white" title={`${mode.abbr}: Not Ranked`}>
                                {mode.abbr}
                              </div>
                            );
                          }
                          
                          const tierColor = mode.tier.startsWith('HT') ? 'bg-red-500' :
                                          mode.tier.startsWith('MIDT') ? 'bg-orange-500' :
                                          mode.tier.startsWith('LT') ? 'bg-blue-500' : 'bg-gray-500';
                          
                          return (
                            <div key={mode.key} className={`px-2 py-1 rounded ${tierColor} text-xs font-bold text-white`} title={`${mode.abbr}: ${mode.tier}`}>
                              {mode.abbr}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Admin Actions */}
                      {isAdminMode && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPlayer(player);
                              setShowAdminPanel(true);
                            }}
                            data-testid={`edit-player-${player.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePlayerMutation.mutate(player.id);
                            }}
                            data-testid={`delete-player-${player.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Individual Gamemode Tier Lists */}
        {(gameModes as readonly any[]).filter((mode: any) => mode.key !== 'overall').map((gameMode: any) => (
          <TabsContent key={gameMode.key} value={gameMode.key} className="space-y-6">
            {/* Vertical Tier List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                        <h3 className={`font-bold text-lg ${tierLevel.textColor} tier-title`}>
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
                        tieredPlayers.map((player, index) => (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            ranking={index + 1}
                            isAdmin={isAdminMode}
                            simplified={true}
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
          onAdminLogin={handleAdminLogin}
          editingPlayer={editingPlayer}
        />
      )}
    </div>
  );
}
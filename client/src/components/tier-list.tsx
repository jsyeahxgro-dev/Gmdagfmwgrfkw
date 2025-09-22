import { useState, useEffect } from "react";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Settings, Edit, Trash2, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { PlayerCard } from "./player-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerProfileModal } from "./player-profile-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Player, GameMode } from "@shared/schema";
import { gameModes, tierLevels, getTierColor, calculatePlayerPoints, getTitleFromPoints, getTierDisplayName } from "@shared/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Removed drag and drop imports - using only buttons for reordering

// Simple Player Card Component - no drag and drop
interface SimplePlayerCardProps {
  player: Player;
  ranking?: number;
  isAdmin?: boolean;
  onEdit?: (player: Player) => void;
  onDelete?: (id: string) => void;
  gameMode?: string;
  isReorderMode?: boolean;
  onMoveUp?: (playerId: string) => void;
  onMoveDown?: (playerId: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

function SimplePlayerCard({ player, ranking, isAdmin, onEdit, onDelete, gameMode, isReorderMode, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: SimplePlayerCardProps) {
  return (
    <PlayerCard
      player={player}
      ranking={ranking}
      isAdmin={isAdmin}
      simplified={true}
      gameMode={gameMode}
      isReorderMode={isReorderMode}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

// Simple Tier Component - no drag and drop
interface SimpleTierProps {
  tierKey: string;
  tierLevel: any;
  children: React.ReactNode;
}

function SimpleTier({ tierKey, tierLevel, children }: SimpleTierProps) {
  const hasPlayers = React.Children.count(children) > 0;

  return (
    <Card 
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
            Players: {React.Children.count(children)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasPlayers ? (
          children
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No players in this tier</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TierListProps {
  players: Player[];
  isLoading: boolean;
}

export function TierList({ players, isLoading }: TierListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>("overall");
  const [isAdminMode, setIsAdminMode] = useState(false);
  // Removed activePlayer state - no longer needed without drag and drop
  
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [showTierChangeDialog, setShowTierChangeDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    playerId: string;
    playerName: string;
    direction: 'up' | 'down';
    currentTier: string;
    newTier: string;
    tierKey: string;
  } | null>(null);
  const [showPlayerProfile, setShowPlayerProfile] = useState(false);
  const [selectedPlayerForProfile, setSelectedPlayerForProfile] = useState<Player | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle player profile modal
  const handlePlayerProfileClick = (player: Player) => {
    if (selectedGameMode === 'overall') {
      setSelectedPlayerForProfile(player);
      setShowPlayerProfile(true);
    }
  };

  // Removed drag and drop sensors - using only buttons for reordering

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

  // Handle tier change confirmation
  const handleTierChangeConfirmation = async () => {
    if (!pendingMove) return;
    
    const newTier = getNewTierForCrossBoundary(
      getTierForGameMode(players.find(p => p.id === pendingMove.playerId)!, selectedGameMode),
      pendingMove.direction
    );
    
    try {
      await updatePlayerTierMutation.mutateAsync({
        playerId: pendingMove.playerId,
        gameMode: selectedGameMode,
        tier: newTier,
      });
      
      setShowTierChangeDialog(false);
      setPendingMove(null);
    } catch (error) {
      console.error('Failed to update tier:', error);
    }
  };

  const updatePlayerTierMutation = useMutation({
    mutationFn: async ({ playerId, gameMode, tier }: { playerId: string; gameMode: string; tier: string }) => {
      const response = await apiRequest("PATCH", `/api/players/${playerId}/tier`, { gameMode, tier });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Player moved",
        description: "Player tier has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update player tier",
        variant: "destructive",
      });
    },
  });

  const reorderPlayersMutation = useMutation({
    mutationFn: async ({ tierKey, playerOrders }: { tierKey: string; playerOrders: string[] }) => {
      const response = await apiRequest("POST", "/api/players/reorder", { tierKey, playerOrders });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate tier orders cache to keep it fresh
      queryClient.invalidateQueries({ queryKey: ["/api/players/tier-orders", selectedGameMode] });
      toast({
        title: "Order updated",
        description: "Player order has been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save player order",
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
        // For overall, calculate tier based on total points
        const totalPoints = calculatePlayerPoints(player);
        
        if (totalPoints === 0) return "NR";
        
        // Tier based on points (using same logic as title calculation but for tiers)
        if (totalPoints >= 450) return "HT1";
        if (totalPoints >= 350) return "HT2";
        if (totalPoints >= 250) return "HT3";
        if (totalPoints >= 150) return "LT1";
        if (totalPoints >= 100) return "LT2";
        if (totalPoints >= 50) return "LT3";
        return "LT4";
      default: return "NR";
    }
  };

  const getPlayersForTier = (tierKey: string) => {
    const tierLevel = tierLevels.find(t => t.key === tierKey);
    if (!tierLevel) return [];

    const tieredPlayers = filteredPlayers.filter(player => {
      const playerTier = getTierForGameMode(player, selectedGameMode);
      return (tierLevel.tiers as readonly string[]).includes(playerTier);
    });

    // Sort players within the tier level according to tier order (HT1 > MIDT1 > LT1, etc.)
    const tierOrder = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5", "NR"];
    return tieredPlayers.sort((a, b) => {
      const aTier = getTierForGameMode(a, selectedGameMode);
      const bTier = getTierForGameMode(b, selectedGameMode);
      return tierOrder.indexOf(aTier) - tierOrder.indexOf(bTier);
    });
  };

  // Add support for custom player ordering within tiers
  const [playerOrders, setPlayerOrders] = useState<Record<string, string[]>>({});

  // Fetch saved tier orders for the current game mode
  const { data: tierOrdersData } = useQuery({
    queryKey: ["/api/players/tier-orders", selectedGameMode],
    queryFn: async () => {
      if (selectedGameMode === 'overall') return {};
      
      const newOrders: Record<string, string[]> = {};
      
      // Fetch orders for each tier level
      for (const tierLevel of tierLevels) {
        const orderKey = `${selectedGameMode}-${tierLevel.key}`;
        try {
          const response = await apiRequest("GET", `/api/players/tier-order/${orderKey}`);
          const data = await response.json();
          if (data.playerOrders && data.playerOrders.length > 0) {
            newOrders[orderKey] = data.playerOrders;
          }
        } catch (error) {
          // Ignore errors for individual tier levels (they may not exist yet)
        }
      }
      
      return newOrders;
    },
    enabled: selectedGameMode !== 'overall',
  });

  // Update local state when tier orders data changes
  useEffect(() => {
    if (tierOrdersData) {
      setPlayerOrders(tierOrdersData);
    }
  }, [tierOrdersData]);

  // Helper function to get tier type (High, Mid, Low)
  const getTierType = (tier: string): 'High' | 'Mid' | 'Low' | 'NR' => {
    if (tier === 'NR') return 'NR';
    if (tier.startsWith('HT')) return 'High';
    if (tier.startsWith('MIDT')) return 'Mid';
    if (tier.startsWith('LT')) return 'Low';
    return 'NR';
  };

  // Helper function to get the next/previous tier when crossing boundaries
  const getNewTierForCrossBoundary = (currentTier: string, direction: 'up' | 'down'): string => {
    const tierNum = currentTier.match(/\d+/)?.[0] || '1';
    
    if (direction === 'up') {
      if (currentTier.startsWith('LT')) return `MIDT${tierNum}`;
      if (currentTier.startsWith('MIDT')) return `HT${tierNum}`;
    } else {
      if (currentTier.startsWith('HT')) return `MIDT${tierNum}`;
      if (currentTier.startsWith('MIDT')) return `LT${tierNum}`;
    }
    return currentTier;
  };

  // Move player up/down with tier boundary checking
  const movePlayerUp = (playerId: string, tierKey: string) => {
    const tierPlayers = getOrderedPlayersForTier(tierKey);
    const currentIndex = tierPlayers.findIndex(p => p.id === playerId);
    
    if (currentIndex === 0) {
      // At the top of the tier - check if we can move to a higher tier type
      const player = tierPlayers[currentIndex];
      const currentTier = getTierForGameMode(player, selectedGameMode);
      const currentTierType = getTierType(currentTier);
      
      if (currentTierType === 'Low') {
        // Can move from Low to Mid
        const newTier = getNewTierForCrossBoundary(currentTier, 'up');
        setPendingMove({
          playerId,
          playerName: player.name,
          direction: 'up',
          currentTier: getTierDisplayName(currentTier),
          newTier: getTierDisplayName(newTier),
          tierKey
        });
        setShowTierChangeDialog(true);
        return;
      } else if (currentTierType === 'Mid') {
        // Can move from Mid to High
        const newTier = getNewTierForCrossBoundary(currentTier, 'up');
        setPendingMove({
          playerId,
          playerName: player.name,
          direction: 'up',
          currentTier: getTierDisplayName(currentTier),
          newTier: getTierDisplayName(newTier),
          tierKey
        });
        setShowTierChangeDialog(true);
        return;
      }
      // High tier can't move up
      return;
    }
    
    if (currentIndex > 0) {
      // Check if the player above is in a different tier type
      const player = tierPlayers[currentIndex];
      const playerAbove = tierPlayers[currentIndex - 1];
      const currentTier = getTierForGameMode(player, selectedGameMode);
      const tierAbove = getTierForGameMode(playerAbove, selectedGameMode);
      
      if (getTierType(currentTier) !== getTierType(tierAbove)) {
        // Cross tier boundary
        setPendingMove({
          playerId,
          playerName: player.name,
          direction: 'up',
          currentTier: getTierDisplayName(currentTier),
          newTier: getTierDisplayName(tierAbove),
          tierKey
        });
        setShowTierChangeDialog(true);
        return;
      }
      
      // Normal reorder within same tier type
      const newOrder = [...tierPlayers];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      
      const orderKey = `${selectedGameMode}-${tierKey}`;
      const newPlayerIds = newOrder.map(p => p.id);
      
      setPlayerOrders(prev => ({
        ...prev,
        [orderKey]: newPlayerIds
      }));
      
      // Persist the order change to the server
      reorderPlayersMutation.mutate({
        tierKey: orderKey,
        playerOrders: newPlayerIds
      });
    }
  };

  const movePlayerDown = (playerId: string, tierKey: string) => {
    const tierPlayers = getOrderedPlayersForTier(tierKey);
    const currentIndex = tierPlayers.findIndex(p => p.id === playerId);
    
    if (currentIndex === tierPlayers.length - 1) {
      // At the bottom of the tier - check if we can move to a lower tier type
      const player = tierPlayers[currentIndex];
      const currentTier = getTierForGameMode(player, selectedGameMode);
      const currentTierType = getTierType(currentTier);
      
      if (currentTierType === 'High') {
        // Can move from High to Mid
        const newTier = getNewTierForCrossBoundary(currentTier, 'down');
        setPendingMove({
          playerId,
          playerName: player.name,
          direction: 'down',
          currentTier: getTierDisplayName(currentTier),
          newTier: getTierDisplayName(newTier),
          tierKey
        });
        setShowTierChangeDialog(true);
        return;
      } else if (currentTierType === 'Mid') {
        // Can move from Mid to Low
        const newTier = getNewTierForCrossBoundary(currentTier, 'down');
        setPendingMove({
          playerId,
          playerName: player.name,
          direction: 'down',
          currentTier: getTierDisplayName(currentTier),
          newTier: getTierDisplayName(newTier),
          tierKey
        });
        setShowTierChangeDialog(true);
        return;
      }
      // Low tier can't move down
      return;
    }
    
    if (currentIndex < tierPlayers.length - 1) {
      // Check if the player below is in a different tier type
      const player = tierPlayers[currentIndex];
      const playerBelow = tierPlayers[currentIndex + 1];
      const currentTier = getTierForGameMode(player, selectedGameMode);
      const tierBelow = getTierForGameMode(playerBelow, selectedGameMode);
      
      if (getTierType(currentTier) !== getTierType(tierBelow)) {
        // Cross tier boundary
        setPendingMove({
          playerId,
          playerName: player.name,
          direction: 'down',
          currentTier: getTierDisplayName(currentTier),
          newTier: getTierDisplayName(tierBelow),
          tierKey
        });
        setShowTierChangeDialog(true);
        return;
      }
      
      // Normal reorder within same tier type
      const newOrder = [...tierPlayers];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      
      const orderKey = `${selectedGameMode}-${tierKey}`;
      const newPlayerIds = newOrder.map(p => p.id);
      
      setPlayerOrders(prev => ({
        ...prev,
        [orderKey]: newPlayerIds
      }));
      
      // Persist the order change to the server
      reorderPlayersMutation.mutate({
        tierKey: orderKey,
        playerOrders: newPlayerIds
      });
    }
  };

  const getOrderedPlayersForTier = (tierKey: string) => {
    const players = getPlayersForTier(tierKey);
    const orderKey = `${selectedGameMode}-${tierKey}`;
    const savedOrder = playerOrders[orderKey];
    
    if (savedOrder) {
      // Sort according to saved order, putting new players at the end
      const orderedPlayers = [...players];
      orderedPlayers.sort((a, b) => {
        const aIndex = savedOrder.indexOf(a.id);
        const bIndex = savedOrder.indexOf(b.id);
        if (aIndex === -1 && bIndex === -1) {
          // Both players are new, maintain natural sort
          const tierOrder = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5", "NR"];
          const aTier = getTierForGameMode(a, selectedGameMode);
          const bTier = getTierForGameMode(b, selectedGameMode);
          return tierOrder.indexOf(aTier) - tierOrder.indexOf(bTier);
        }
        if (aIndex === -1) return 1; // New players go to end
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
      return orderedPlayers;
    }
    
    return players;
  };

  // Removed drag handlers - using only up/down arrow buttons for reordering

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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
        <div className="relative w-full sm:flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-9"
            data-testid="search-input"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Button
            variant={isAdminMode ? "default" : "outline"}
            onClick={() => {
              if (!isAdminMode) {
                // Admin panel removed - no action
              } else {
                setIsAdminMode(false);
              }
            }}
            className="h-10 sm:h-9 px-3 sm:px-4 text-sm"
            data-testid="toggle-admin-mode"
          >
            <Settings className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline ml-2">{isAdminMode ? "Exit Admin" : "Admin Mode"}</span>
            <span className="sm:hidden">Admin</span>
          </Button>
          {isAdminMode && (
            <div className="flex gap-2">
              <Button
                onClick={() => {/* Admin panel removed - no action */}}
                className="h-10 sm:h-9 px-3 sm:px-4 text-sm"
                data-testid="add-player-button"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline ml-2">Add Player</span>
                <span className="sm:hidden">Add</span>
              </Button>
              {selectedGameMode !== "overall" && (
                <Button
                  onClick={() => setIsReorderMode(!isReorderMode)}
                  variant={isReorderMode ? "destructive" : "outline"}
                  className="h-10 sm:h-9 px-3 sm:px-4 text-sm"
                  data-testid="reorder-toggle-button"
                >
                  <RotateCcw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline ml-2">{isReorderMode ? "Exit Reorder" : "Reorder"}</span>
                  <span className="sm:hidden">{isReorderMode ? "Exit" : "Reorder"}</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Game Mode Tabs */}
      <Tabs value={selectedGameMode} onValueChange={(value) => setSelectedGameMode(value as GameMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-card/80 backdrop-blur-sm border border-border/50 h-auto min-h-[40px] sm:min-h-[36px]">
          {(gameModes as readonly any[]).map((gameMode: any) => (
            <TabsTrigger
              key={gameMode.key}
              value={gameMode.key}
              className="flex items-center justify-center gap-1 sm:gap-2 gamemode-tab-inactive data-[state=active]:gamemode-tab-active px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm"
              data-testid={`gamemode-tab-${gameMode.key}`}
            >
              <span className="text-sm">{gameMode.icon}</span>
              <span className="hidden sm:inline font-medium">{gameMode.name}</span>
              <span className="sm:hidden font-medium text-xs">{gameMode.abbr}</span>
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
                    // Sort by points in descending order (highest first)
                    const aPoints = calculatePlayerPoints(a);
                    const bPoints = calculatePlayerPoints(b);
                    return bPoints - aPoints;
                  })
                  .map((player, index) => (
                    <div 
                      key={player.id} 
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      data-testid={`leaderboard-player-${player.id}`}
                      onClick={() => handlePlayerProfileClick(player)}
                    >
                      {/* Ranking */}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg minecraft-font ${
                        index === 0 ? 'rank-1' :
                        index === 1 ? 'rank-2' :
                        index === 2 ? 'rank-3' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        #{index + 1}
                      </div>
                      
                      {/* Player Info */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-border/30 flex-shrink-0">
                          <AvatarImage 
                            src={`https://mc-heads.net/avatar/${player.name}/64`}
                            alt={`${player.name}'s skin`}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{player.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{getTitleFromPoints(calculatePlayerPoints(player))}</p>
                        </div>
                      </div>
                      
                      {/* Overall Tier and Mode Badges */}
                      <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                        {/* Points */}
                        <div className="text-xs sm:text-sm font-bold text-muted-foreground">
                          <span className="hidden sm:inline">Points: </span><span className="text-foreground">{calculatePlayerPoints(player)}</span>
                        </div>
                        
                        {/* Gamemode Badges */}
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { key: 'skywars', tier: player.skywarsTier, abbr: 'SW', name: 'Skywars' },
                            { key: 'midfight', tier: player.midfightTier, abbr: 'Midf', name: 'Midfight' },
                            { key: 'nodebuff', tier: player.nodebuffTier, abbr: 'NoDb', name: 'Nodebuff' },
                            { key: 'bedfight', tier: player.bedfightTier, abbr: 'Bed', name: 'Bedfight' },
                            { key: 'uhc', tier: player.uhcTier, abbr: 'UHC', name: 'UHC' }
                          ].map(mode => {
                            if (!mode.tier || mode.tier === 'NR') {
                              return (
                                <div key={mode.key} className="px-2 py-1 rounded-md bg-gradient-to-r from-gray-600 to-gray-700 text-xs font-bold text-gray-200 shadow-sm border border-gray-500" title={`${mode.name}: Not Ranked`}>
                                  {mode.abbr}: NR
                                </div>
                              );
                            }
                            
                            // All tiers have same color in overall view except NR
                            const tierColor = 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-md border border-blue-400';
                            
                            return (
                              <div key={mode.key} className={`px-2 py-1 rounded-md ${tierColor} text-xs font-bold text-white backdrop-blur-sm`} title={`${mode.name}: ${getTierDisplayName(mode.tier)}`}>
                                {mode.abbr}: {getTierDisplayName(mode.tier)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Admin Actions */}
                      {isAdminMode && (
                        <div className="flex gap-2">
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
            {/* Vertical Tier List - 5 Main Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {tierLevels.map((tierLevel) => {
                const playersInTier = getOrderedPlayersForTier(tierLevel.key);
                
                return (
                  <SimpleTier 
                    key={tierLevel.key} 
                    tierKey={tierLevel.key}
                    tierLevel={tierLevel}
                  >
                      {playersInTier.map((player, index) => (
                        <SimplePlayerCard
                          key={player.id}
                          player={player}
                          ranking={index + 1}
                          isAdmin={isAdminMode}
                          gameMode={gameMode.key}
                          isReorderMode={isReorderMode}
                          onMoveUp={(playerId: string) => movePlayerUp(playerId, tierLevel.key)}
                          onMoveDown={(playerId: string) => movePlayerDown(playerId, tierLevel.key)}
                          canMoveUp={index > 0}
                          canMoveDown={index < playersInTier.length - 1}
                          onEdit={(player) => {
                            if (!isReorderMode) {
                              // Admin panel removed - editing functionality will be integrated into tier-list
                            }
                          }}
                          onDelete={(id) => {
                            if (!isReorderMode) {
                              deletePlayerMutation.mutate(id);
                            }
                          }}
                        />
                      ))}
                  </SimpleTier>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>


      {/* Tier Change Confirmation Dialog */}
      <AlertDialog open={showTierChangeDialog} onOpenChange={setShowTierChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Player Tier</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMove && (
                <>
                  Moving <strong>{pendingMove.playerName}</strong> {pendingMove.direction} will change their tier from{' '}
                  <strong>{pendingMove.currentTier}</strong> to <strong>{pendingMove.newTier}</strong>.
                  <br /><br />
                  Do you want to proceed with this tier change?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowTierChangeDialog(false);
              setPendingMove(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleTierChangeConfirmation}>
              Change Tier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Player Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayerForProfile}
        isOpen={showPlayerProfile}
        onClose={() => {
          setShowPlayerProfile(false);
          setSelectedPlayerForProfile(null);
        }}
        playerRanking={
          selectedPlayerForProfile 
            ? filteredPlayers
                .sort((a, b) => calculatePlayerPoints(b) - calculatePlayerPoints(a))
                .findIndex(p => p.id === selectedPlayerForProfile.id) + 1
            : undefined
        }
      />
    </div>
  );
}
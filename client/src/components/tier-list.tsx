import { useState } from "react";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Settings, Edit, Trash2, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { PlayerCard } from "./player-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminPanel } from "./admin-panel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Player, GameMode } from "@shared/schema";
import { gameModes, tierLevels, getTierColor, calculatePlayerPoints, getTitleFromPoints, getTierDisplayName } from "@shared/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

// Draggable Player Component
interface DraggablePlayerCardProps {
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

function DraggablePlayerCard({ player, ranking, isAdmin, onEdit, onDelete, gameMode, isReorderMode, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: DraggablePlayerCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: player.id,
    disabled: !isAdmin  // Only allow dragging in admin mode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Only add drag listeners if in admin mode
  const dragProps = isAdmin ? { ...attributes, ...listeners } : {};

  return (
    <div ref={setNodeRef} style={style} {...dragProps}>
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
    </div>
  );
}

// Droppable Tier Component
interface DroppableTierProps {
  tierKey: string;
  tierLevel: any;
  children: React.ReactNode;
  isAdminMode: boolean;
}

function DroppableTier({ tierKey, tierLevel, children, isAdminMode }: DroppableTierProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `tier-${tierKey}`,
  });

  const hasPlayers = React.Children.count(children) > 0;

  return (
    <Card 
      ref={setNodeRef}
      className={`min-h-[400px] bg-card/30 backdrop-blur-sm border-border/50 ${
        isOver && isAdminMode ? 'border-primary border-2' : ''
      }`}
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
        ) : isAdminMode ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Drop players here</p>
          </div>
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  
  // Handle admin mode state from admin panel
  const handleAdminLogin = () => {
    setIsAdminMode(true);
    setIsAuthenticated(true);
  };
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
      
      setPlayerOrders(prev => ({
        ...prev,
        [`${selectedGameMode}-${tierKey}`]: newOrder.map(p => p.id)
      }));
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
      
      setPlayerOrders(prev => ({
        ...prev,
        [`${selectedGameMode}-${tierKey}`]: newOrder.map(p => p.id)
      }));
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

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const player = players.find(p => p.id === active.id);
    setActivePlayer(player || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlayer(null);

    if (!over || !isAdminMode) return;

    const playerId = active.id as string;
    const overId = over.id as string;
    const activePlayer = filteredPlayers.find(p => p.id === playerId);
    if (!activePlayer) return;

    // Handle dropping on tier areas (moving to different tier)
    if (overId.startsWith("tier-")) {
      const targetTierKey = overId.replace("tier-", "");
      const tierLevel = tierLevels.find(t => t.key === targetTierKey);
      
      if (tierLevel && selectedGameMode !== "overall") {
        // Move to first tier in the target tier level (e.g., T1 -> HT1)
        const firstTierInLevel = (tierLevel.tiers as readonly string[])[0];
        
        updatePlayerTierMutation.mutate({
          playerId,
          gameMode: selectedGameMode,
          tier: firstTierInLevel,
        });
      }
      return;
    }

    // Handle reordering within same tier level
    const overPlayer = filteredPlayers.find(p => p.id === overId);
    if (!overPlayer) return;

    const activeTier = getTierForGameMode(activePlayer, selectedGameMode);
    const overTier = getTierForGameMode(overPlayer, selectedGameMode);

    // Find which tier level both players belong to
    const activeTierLevel = tierLevels.find(t => (t.tiers as readonly string[]).includes(activeTier));
    const overTierLevel = tierLevels.find(t => (t.tiers as readonly string[]).includes(overTier));

    if (!activeTierLevel || !overTierLevel || activeTierLevel.key !== overTierLevel.key) {
      return; // Can only reorder within the same tier level
    }

    // Update local order state
    const tierKey = activeTierLevel.key;
    const orderKey = `${selectedGameMode}-${tierKey}`;
    const currentPlayers = getOrderedPlayersForTier(tierKey);
    const activeIndex = currentPlayers.findIndex(p => p.id === playerId);
    const overIndex = currentPlayers.findIndex(p => p.id === overId);

    if (activeIndex !== -1 && overIndex !== -1) {
      const newOrder = arrayMove(
        currentPlayers.map(p => p.id),
        activeIndex,
        overIndex
      );
      
      setPlayerOrders(prev => ({
        ...prev,
        [orderKey]: newOrder
      }));
    }
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAdminPanel(true)}
                data-testid="add-player-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
              {selectedGameMode !== "overall" && (
                <Button
                  onClick={() => setIsReorderMode(!isReorderMode)}
                  variant={isReorderMode ? "destructive" : "outline"}
                  data-testid="reorder-toggle-button"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isReorderMode ? "Exit Reorder" : "Reorder"}
                </Button>
              )}
            </div>
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
              className="flex items-center gap-2 gamemode-tab-inactive data-[state=active]:gamemode-tab-active px-4 py-3 font-medium"
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
                    // Sort by points in descending order (highest first)
                    const aPoints = calculatePlayerPoints(a);
                    const bPoints = calculatePlayerPoints(b);
                    return bPoints - aPoints;
                  })
                  .map((player, index) => (
                    <div key={player.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`leaderboard-player-${player.id}`}>
                      {/* Ranking */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg minecraft-font ${
                        index === 0 ? 'rank-1' :
                        index === 1 ? 'rank-2' :
                        index === 2 ? 'rank-3' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        #{index + 1}
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
                          <p className="text-sm text-muted-foreground">{getTitleFromPoints(calculatePlayerPoints(player))}</p>
                        </div>
                      </div>
                      
                      {/* Overall Tier and Mode Badges */}
                      <div className="flex flex-col items-end gap-2">
                        {/* Points */}
                        <div className="text-sm font-bold text-muted-foreground">
                          Points: <span className="text-foreground">{calculatePlayerPoints(player)}</span>
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
                  <SortableContext 
                    key={tierLevel.key} 
                    items={playersInTier.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableTier 
                      tierKey={tierLevel.key}
                      tierLevel={tierLevel}
                      isAdminMode={isAdminMode}
                    >
                      {playersInTier.map((player, index) => (
                        <DraggablePlayerCard
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
                              setEditingPlayer(player);
                              setShowAdminPanel(true);
                            }
                          }}
                          onDelete={(id) => {
                            if (!isReorderMode) {
                              deletePlayerMutation.mutate(id);
                            }
                          }}
                        />
                      ))}
                    </DroppableTier>
                  </SortableContext>
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
          isAuthenticated={isAuthenticated}
        />
      )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activePlayer ? (
          <PlayerCard
            player={activePlayer}
            isAdmin={isAdminMode}
            simplified={true}
            gameMode={selectedGameMode}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
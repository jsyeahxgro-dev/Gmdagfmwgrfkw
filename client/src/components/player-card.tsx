import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { Player } from "@shared/schema";
import { getTierColor, gameModes, tierOptions, calculatePlayerPoints, getTitleFromPoints } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  ranking?: number;
  isAdmin?: boolean;
  onEdit?: (player: Player) => void;
  onDelete?: (id: string) => void;
  simplified?: boolean;  // For tier lists, show simplified version
  gameMode?: string; // To determine if we should show shiny ranks or not
  isReorderMode?: boolean; // Whether reorder mode is active
  onMoveUp?: (playerId: string) => void;
  onMoveDown?: (playerId: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}


export function PlayerCard({ player, ranking, isAdmin = false, onEdit, onDelete, simplified = false, gameMode, isReorderMode = false, onMoveUp, onMoveDown, canMoveUp = true, canMoveDown = true }: PlayerCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const getMinecraftSkinUrl = (playerName: string) => {
    // Use Minecraft avatar API
    return `https://mc-heads.net/avatar/${playerName}/64`;
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(player);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm(`Are you sure you want to delete ${player.name}?`)) {
      onDelete(player.id);
    }
  };

  // Get player's current tier for color coding
  const getCurrentTier = () => {
    const tiers = [
      player.skywarsTier, player.midfightTier, player.uhcTier,
      player.nodebuffTier, player.bedfightTier
    ].filter(tier => tier && tier !== "NR");
    
    if (tiers.length === 0) return "NR";
    
    const tierOrder = ["HT1", "MT1", "LT1", "HT2", "MT2", "LT2", "HT3", "MT3", "LT3", "HT4", "MT4", "LT4", "HT5", "MT5", "LT5"];
    for (const tier of tierOrder) {
      if (tiers.includes(tier)) return tier;
    }
    return "NR";
  };

  // Get the tier for the specific game mode if in simplified view
  const getGameModeTier = () => {
    if (!gameMode || gameMode === 'overall') return getCurrentTier();
    
    switch (gameMode) {
      case 'skywars': return player.skywarsTier || "NR";
      case 'midfight': return player.midfightTier || "NR";
      case 'uhc': return player.uhcTier || "NR";
      case 'nodebuff': return player.nodebuffTier || "NR";
      case 'bedfight': return player.bedfightTier || "NR";
      default: return getCurrentTier();
    }
  };
  
  const currentTier = simplified ? getGameModeTier() : getCurrentTier();
  const tierColorClass = getTierColor(currentTier);


  if (simplified) {
    // Simplified version for tier lists
    return (
      <Card 
        className={`group relative hover:shadow-md transition-all duration-200 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 border-l-4 ${tierColorClass} ${isAdmin ? 'cursor-pointer' : ''}`} 
        data-testid={`player-card-${player.id}`}
        onClick={isAdmin && onEdit ? handleEdit : undefined}
      >
        <CardContent className="p-3">
          <div className="text-center">
            {ranking && (
              <span className={`text-sm font-bold block mb-1 ${
                ranking === 1 ? 'rank-1' : 
                ranking === 2 ? 'rank-2' : 
                ranking === 3 ? 'rank-3' : 
                'minecraft-font text-primary'
              }`}>
                #{ranking}
              </span>
            )}
            <p className="font-semibold text-sm truncate" data-testid={`player-name-${player.id}`}>
              {player.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentTier}
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="h-6 px-2"
                data-testid={`edit-player-${player.id}`}
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`group relative hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 border-l-4 ${tierColorClass} ${isAdmin ? 'cursor-pointer' : ''}`} 
      data-testid={`player-card-${player.id}`}
      onClick={isAdmin ? handleEdit : undefined}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3 mb-2">
          <Avatar className="w-10 h-10 border-2 border-border/30">
            {!imageError ? (
              <AvatarImage 
                src={getMinecraftSkinUrl(player.name)}
                alt={`${player.name}'s skin`}
                onError={() => setImageError(true)}
                data-testid={`player-avatar-${player.id}`}
              />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
              {player.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {ranking && (
                <span className={`text-sm font-bold ${
                  gameMode === 'overall' && ranking <= 3 ? 
                    (ranking === 1 ? 'rank-1' : 
                     ranking === 2 ? 'rank-2' : 
                     'rank-3') :
                  'minecraft-font text-muted-foreground'
                }`}>
                  #{ranking}
                </span>
              )}
              <p className="font-semibold text-foreground truncate" data-testid={`player-name-${player.id}`}>
                {player.name}
              </p>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {getTitleFromPoints(calculatePlayerPoints(player))}
            </p>
            {/* Show gamemode tiers in overall ranking only */}
            {!simplified && (
              <div className="flex flex-wrap gap-1 mt-1">
                {[
                  { key: 'skywars', tier: player.skywarsTier, abbr: 'SW' },
                  { key: 'midfight', tier: player.midfightTier, abbr: 'Midf' },
                  { key: 'nodebuff', tier: player.nodebuffTier, abbr: 'NoDb' },
                  { key: 'bedfight', tier: player.bedfightTier, abbr: 'Bed' },
                  { key: 'uhc', tier: player.uhcTier, abbr: 'UHC' }
                ].filter(mode => mode.tier && mode.tier !== "NR").map(mode => (
                  <Badge key={mode.key} variant="outline" className="text-xs px-1 py-0">
                    {mode.abbr}: {mode.tier}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isReorderMode ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMoveUp && onMoveUp(player.id)}
                  disabled={!canMoveUp}
                  className="h-8 px-3"
                  data-testid={`move-up-player-${player.id}`}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMoveDown && onMoveDown(player.id)}
                  disabled={!canMoveDown}
                  className="h-8 px-3"
                  data-testid={`move-down-player-${player.id}`}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEdit}
                  className="h-8 px-3"
                  data-testid={`edit-player-${player.id}`}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  className="h-8 px-3"
                  data-testid={`delete-player-${player.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, X } from "lucide-react";
import type { Player } from "@shared/schema";
import { getTierColor, gameModes, tierOptions } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  ranking?: number;
  isAdmin?: boolean;
  onEdit?: (player: Player) => void;
  onDelete?: (id: string) => void;
  simplified?: boolean;  // For tier lists, show simplified version
}

interface QuickEditProps {
  player: Player;
  onSave: (data: { name: string; tier: string; gameMode: string }) => void;
  onCancel: () => void;
}

function QuickEdit({ player, onSave, onCancel }: QuickEditProps) {
  const [name, setName] = useState(player.name);
  const [selectedGameMode, setSelectedGameMode] = useState<string>('skywars');
  const [selectedTier, setSelectedTier] = useState<string>('NR');
  
  const handleSave = () => {
    onSave({ name, tier: selectedTier, gameMode: selectedGameMode });
  };
  
  return (
    <div className="p-3 border rounded-lg bg-background/80 backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Quick Edit</h4>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Player Name</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
            data-testid="quick-edit-name"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Gamemode</label>
            <Select value={selectedGameMode} onValueChange={setSelectedGameMode}>
              <SelectTrigger className="h-8 text-sm" data-testid="quick-edit-gamemode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gameModes.filter(mode => mode.key !== 'overall').map((gameMode) => (
                  <SelectItem key={gameMode.key} value={gameMode.key}>
                    {gameMode.abbr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tier</label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="h-8 text-sm" data-testid="quick-edit-tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tierOptions.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tier === "NR" ? "Not Ranked" : tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="flex-1 h-8" data-testid="quick-edit-save">
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="flex-1 h-8" data-testid="quick-edit-cancel">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PlayerCard({ player, ranking, isAdmin = false, onEdit, onDelete, simplified = false }: PlayerCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  
  const getMinecraftSkinUrl = (playerName: string) => {
    // Use Minecraft avatar API
    return `https://mc-heads.net/avatar/${playerName}/64`;
  };

  const handleEdit = () => {
    if (isAdmin) {
      setIsQuickEditing(true);
    } else if (onEdit) {
      onEdit(player);
    }
  };
  
  const handleQuickEditSave = (data: { name: string; tier: string; gameMode: string }) => {
    // Here you would typically make an API call to update the player
    // For now, we'll simulate by calling onEdit with updated data
    if (onEdit) {
      const updatedPlayer = { ...player, name: data.name, [`${data.gameMode}Tier`]: data.tier };
      onEdit(updatedPlayer);
    }
    setIsQuickEditing(false);
  };

  const handleDelete = () => {
    if (onDelete && confirm(`Are you sure you want to delete ${player.name}?`)) {
      onDelete(player.id);
    }
  };

  // Get player's current tier for color coding
  const getCurrentTier = () => {
    const tiers = [
      player.skywarsTier, player.midfightTier, player.bridgeTier, player.crystalTier,
      player.sumoTier, player.nodebuffTier, player.bedfightTier, player.uhcTier
    ].filter(tier => tier && tier !== "NR");
    
    if (tiers.length === 0) return "NR";
    
    const tierOrder = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5"];
    for (const tier of tierOrder) {
      if (tiers.includes(tier)) return tier;
    }
    return "NR";
  };
  
  const currentTier = getCurrentTier();
  const tierColorClass = getTierColor(currentTier);

  if (isQuickEditing) {
    return (
      <QuickEdit 
        player={player}
        onSave={handleQuickEditSave}
        onCancel={() => setIsQuickEditing(false)}
      />
    );
  }

  if (simplified) {
    // Simplified version for tier lists
    return (
      <Card 
        className={`group relative hover:shadow-md transition-all duration-200 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 border-l-4 ${tierColorClass} ${isAdmin ? 'cursor-pointer' : ''}`} 
        data-testid={`player-card-${player.id}`}
        onClick={isAdmin ? handleEdit : undefined}
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
                  ranking === 1 ? 'rank-1' : 
                  ranking === 2 ? 'rank-2' : 
                  ranking === 3 ? 'rank-3' : 
                  'minecraft-font text-primary'
                }`}>
                  #{ranking}
                </span>
              )}
              <p className="font-semibold text-foreground truncate" data-testid={`player-name-${player.id}`}>
                {player.name}
              </p>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {player.title}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
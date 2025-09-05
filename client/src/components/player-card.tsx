import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import type { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  ranking?: number;
  isAdmin?: boolean;
  onEdit?: (player: Player) => void;
  onDelete?: (id: string) => void;
}

export function PlayerCard({ player, ranking, isAdmin = false, onEdit, onDelete }: PlayerCardProps) {
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

  return (
    <Card className="group relative hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90" data-testid={`player-card-${player.id}`}>
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
            {/* Show gamemode tiers in overall ranking */}
            {window.location.pathname === "/" && (
              <div className="flex flex-wrap gap-1 mt-1">
                {player.skywarsTier !== "NR" && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    Sky: {player.skywarsTier}
                  </Badge>
                )}
                {player.midfightTier !== "NR" && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    Mid: {player.midfightTier}
                  </Badge>
                )}
                {player.nodebuffTier !== "NR" && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    NoDb: {player.nodebuffTier}
                  </Badge>
                )}
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
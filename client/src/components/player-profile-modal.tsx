import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Player } from "@shared/schema";
import { calculatePlayerPoints, getTitleFromPoints, getTierDisplayName, gameModes } from "@shared/schema";

interface PlayerProfileModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  playerRanking?: number;
}

export function PlayerProfileModal({ player, isOpen, onClose, playerRanking }: PlayerProfileModalProps) {
  if (!player) return null;

  const points = calculatePlayerPoints(player);
  const title = getTitleFromPoints(points);

  // Game mode tiers with icons
  const gameModeTiers = [
    { 
      key: 'skywars', 
      name: 'Skywars', 
      tier: player.skywarsTier, 
      icon: '☁️',
      abbr: 'SW'
    },
    { 
      key: 'midfight', 
      name: 'Midfight', 
      tier: player.midfightTier, 
      icon: '⚔️',
      abbr: 'Midf'
    },
    { 
      key: 'uhc', 
      name: 'UHC', 
      tier: player.uhcTier, 
      icon: '💀',
      abbr: 'UHC'
    },
    { 
      key: 'nodebuff', 
      name: 'Nodebuff', 
      tier: player.nodebuffTier, 
      icon: '🛡️',
      abbr: 'NoDb'
    },
    { 
      key: 'bedfight', 
      name: 'Bedfight', 
      tier: player.bedfightTier, 
      icon: '🛏️',
      abbr: 'Bed'
    }
  ];

  // Get tier color for individual game modes - matching the exact tier system colors
  const getTierBadgeColor = (tier: string): string => {
    if (!tier || tier === 'NR') {
      return 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 text-gray-200';
    }
    
    // Match the exact tier colors used in the tier system
    if (tier.startsWith('HT')) return 'bg-gradient-to-r from-red-500 to-red-600 border-red-400 text-white';
    if (tier.startsWith('MIDT')) return 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400 text-white';
    if (tier.startsWith('LT')) return 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 text-white';
    
    return 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400 text-white';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/50">
        <DialogHeader>
          <DialogTitle className="sr-only">Player Profile</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed view of {player?.name}'s ranking, points, and tier information across all game modes.
          </DialogDescription>
        </DialogHeader>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          data-testid="close-player-profile"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center space-y-6 py-6">
          {/* Player Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-emerald-400 overflow-hidden bg-slate-700 shadow-xl shadow-emerald-500/20">
              <Avatar className="w-full h-full">
                <AvatarImage 
                  src={`https://mc-heads.net/avatar/${player.name}/128`}
                  alt={`${player.name}'s skin`}
                />
                <AvatarFallback className="bg-slate-700 text-white text-2xl font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 w-28 h-28 rounded-full border-4 border-emerald-400/30 animate-pulse"></div>
          </div>

          {/* Player Name */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2" data-testid="player-profile-name">
              {player.name}
            </h2>
            
            {/* Title Badge */}
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1">
              {title}
            </Badge>
          </div>

          {/* Ranking and Points */}
          <div className="flex items-center gap-8 text-white">
            {playerRanking && (
              <div className="text-center">
                <div className="text-sm text-emerald-400 font-medium">RANK</div>
                <div className="text-2xl font-bold minecraft-font">#{playerRanking}</div>
                <div className="text-xs text-gray-400">overall</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-sm text-emerald-400 font-medium">POINTS</div>
              <div className="text-2xl font-bold minecraft-font">{points}</div>
              <div className="text-xs text-gray-400">total pts</div>
            </div>
          </div>

          {/* Game Mode Tiers */}
          <div className="w-full">
            <h3 className="text-center text-sm font-semibold text-emerald-400 mb-4 uppercase tracking-wide">
              Gamemode Tiers
            </h3>
            
            <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto">
              {gameModeTiers.map((mode) => {
                const tierDisplayName = getTierDisplayName(mode.tier);
                return (
                  <div 
                    key={mode.key}
                    className={`px-3 py-2 rounded-lg text-sm font-bold shadow-lg border transition-all hover:scale-105 ${getTierBadgeColor(mode.tier)}`}
                    data-testid={`gamemode-tier-${mode.key}`}
                    title={`${mode.name}: ${tierDisplayName}`}
                  >
                    <div className="text-center">
                      <div className="text-xs opacity-90 mb-0.5">{mode.abbr}</div>
                      <div className="font-bold text-xs">{tierDisplayName}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
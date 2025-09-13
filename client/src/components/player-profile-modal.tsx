import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  // Get tier color for individual game modes
  const getTierColor = (tier: string): string => {
    if (!tier || tier === 'NR') return 'bg-gray-600 border-gray-500';
    
    if (tier.startsWith('HT')) return 'bg-red-600 border-red-500';
    if (tier.startsWith('MIDT')) return 'bg-orange-600 border-orange-500';
    if (tier.startsWith('LT')) return 'bg-blue-600 border-blue-500';
    return 'bg-gray-600 border-gray-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/50">
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
            <div className="w-24 h-24 rounded-full border-4 border-emerald-400 overflow-hidden bg-slate-700">
              <Avatar className="w-full h-full">
                <AvatarImage 
                  src={`https://mc-heads.net/avatar/${player.name}/96`}
                  alt={`${player.name}'s skin`}
                />
                <AvatarFallback className="bg-slate-700 text-white text-xl font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
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
          <div className="flex items-center gap-6 text-white">
            {playerRanking && (
              <div className="text-center">
                <div className="text-sm text-gray-400">Ranking</div>
                <div className="text-xl font-bold">#{playerRanking} overall</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-sm text-gray-400">Points</div>
              <div className="text-xl font-bold">{points} pts</div>
            </div>
          </div>

          {/* Game Mode Tiers */}
          <div className="w-full">
            <h3 className="text-center text-sm font-semibold text-emerald-400 mb-4 uppercase tracking-wide">
              Gamemode Tiers
            </h3>
            
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              {gameModeTiers.map((mode) => (
                <div 
                  key={mode.key}
                  className="flex flex-col items-center"
                  data-testid={`gamemode-tier-${mode.key}`}
                >
                  {/* Game Mode Icon */}
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-2 ${getTierColor(mode.tier)}`}>
                    <span className="text-2xl">{mode.icon}</span>
                  </div>
                  
                  {/* Tier Label */}
                  <div className="text-white text-xs font-bold text-center">
                    {getTierDisplayName(mode.tier)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
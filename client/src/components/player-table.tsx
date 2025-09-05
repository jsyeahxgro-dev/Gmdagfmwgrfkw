import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TierBadge } from "./tier-badge";
import type { Player } from "@shared/schema";

interface PlayerTableProps {
  players: Player[];
  isLoading: boolean;
}

export function PlayerTable({ players, isLoading }: PlayerTableProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                {[...Array(8)].map((_, j) => (
                  <Skeleton key={j} className="h-6 w-16" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (players.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No players found</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" data-testid="player-table">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Player</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Combat Title</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Bridge</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Skywars</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Crystal</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Midfight</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-foreground">UHC</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Nodebuff</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Bedfight</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Sumo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {players.map((player, index) => (
              <tr
                key={player.id}
                className="hover:bg-muted/50 transition-colors"
                data-testid={`player-row-${player.id}`}
              >
                <td className="px-6 py-4 text-sm font-medium" data-testid={`rank-${index + 1}`}>
                  #{index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                        {player.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium" data-testid={`player-name-${player.name}`}>
                      {player.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground" data-testid={`player-title-${player.id}`}>
                  {player.title}
                </td>
                <td className="px-6 py-4 text-center">
                  <TierBadge tier={player.bridgeTier} />
                </td>
                <td className="px-6 py-4 text-center">
                  <TierBadge tier={player.skywarsTier} />
                </td>
                <td className="px-6 py-4 text-center">
                  <TierBadge tier={player.crystalTier} />
                </td>
                <td className="px-6 py-4 text-center">
                  <TierBadge tier={player.midfightTier} />
                </td>
                <td className="px-6 py-4 text-center">
                  <TierBadge tier={player.uhcTier} />
                </td>
                <td className="px-6 py-4 text-center">
                  <TierBadge tier={player.nodebuffTier} />
                </td>
                <td className="px-6 py-4 text-center">
                  <TierBadge tier={player.bedfightTier} />
                </td>
                <td className="px-6 py-4 text-center">
                  <TierBadge tier={player.sumoTier} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

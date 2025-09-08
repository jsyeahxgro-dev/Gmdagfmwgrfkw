import { Badge } from "@/components/ui/badge";

interface TierBadgeProps {
  tier: string;
}

const tierConfig = {
  'HT1': { label: 'HighS', className: 'tier-s' },
  'MIDT1': { label: 'MidS', className: 'tier-s' },
  'LT1': { label: 'LowS', className: 'tier-s' },
  'HT2': { label: 'HighA', className: 'tier-a' },
  'MIDT2': { label: 'MidA', className: 'tier-a' },
  'LT2': { label: 'LowA', className: 'tier-a' },
  'HT3': { label: 'HighB', className: 'tier-b' },
  'MIDT3': { label: 'MidB', className: 'tier-b' },
  'LT3': { label: 'LowB', className: 'tier-b' },
  'HT4': { label: 'HighC', className: 'tier-c' },
  'MIDT4': { label: 'MidC', className: 'tier-c' },
  'LT4': { label: 'LowC', className: 'tier-c' },
  'HT5': { label: 'HighD', className: 'tier-d' },
  'MIDT5': { label: 'MidD', className: 'tier-d' },
  'LT5': { label: 'LowD', className: 'tier-d' },
  'NR': { label: 'NR', className: 'tier-nr' }
};

export function TierBadge({ tier }: TierBadgeProps) {
  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig['NR'];
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.className} font-medium`}
      data-testid={`tier-badge-${tier}`}
    >
      {config.label}
    </Badge>
  );
}

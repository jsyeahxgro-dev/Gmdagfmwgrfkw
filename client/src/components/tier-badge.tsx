import { Badge } from "@/components/ui/badge";

interface TierBadgeProps {
  tier: string;
}

const tierConfig = {
  'HT1': { label: 'High S', className: 'tier-s' },
  'HT2': { label: 'High A', className: 'tier-a' },
  'HT3': { label: 'High B', className: 'tier-b' },
  'LT1': { label: 'Low S', className: 'tier-s' },
  'LT2': { label: 'Low A', className: 'tier-a' },
  'LT3': { label: 'Low C', className: 'tier-b' },
  'LT4': { label: 'C Tier', className: 'tier-c' },
  'LT5': { label: 'D Tier', className: 'tier-d' },
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

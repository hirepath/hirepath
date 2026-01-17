import { ApplicationStatus } from '@/types/application';
import { cn } from '@/lib/utils';
import { Bookmark, Send, Users, Trophy, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ApplicationStatus, { label: string; icon: typeof Send; className: string }> = {
  saved: { label: 'Saved', icon: Bookmark, className: 'status-saved' },
  applied: { label: 'Applied', icon: Send, className: 'status-applied' },
  interview: { label: 'Interview', icon: Users, className: 'status-interview' },
  offer: { label: 'Offer', icon: Trophy, className: 'status-offer' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'status-rejected' }
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {config.label}
    </span>
  );
}

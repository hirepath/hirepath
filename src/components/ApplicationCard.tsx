import { Application } from '@/types/application';
import { StatusBadge } from './StatusBadge';
import { Card } from '@/components/ui/card';
import { Building2, MapPin, Calendar, DollarSign, ExternalLink, Bell } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
}

export function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const hasFollowUp = application.followUpDate && !isPast(new Date(application.followUpDate));
  const isFollowUpToday = application.followUpDate && isToday(new Date(application.followUpDate));
  const isFollowUpOverdue = application.followUpDate && isPast(new Date(application.followUpDate)) && !isToday(new Date(application.followUpDate));

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-4 cursor-pointer card-hover bg-card border-border/50 animate-fade-in',
        'hover:border-primary/30'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{application.position}</h3>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="text-sm truncate">{application.company}</span>
          </div>
        </div>
        <StatusBadge status={application.status} size="sm" />
      </div>

      <div className="space-y-1.5 text-sm">
        {application.location && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{application.location}</span>
          </div>
        )}

        {application.salary && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{application.salary}</span>
          </div>
        )}

        {application.dateApplied && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Applied {format(new Date(application.dateApplied), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          {(hasFollowUp || isFollowUpOverdue) && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                isFollowUpToday && 'bg-warning/10 text-warning',
                isFollowUpOverdue && 'bg-destructive/10 text-destructive',
                hasFollowUp && !isFollowUpToday && !isFollowUpOverdue && 'bg-muted text-muted-foreground'
              )}
            >
              <Bell className="h-3 w-3" />
              {isFollowUpToday ? 'Today' : isFollowUpOverdue ? 'Overdue' : format(new Date(application.followUpDate!), 'MMM d')}
            </span>
          )}
        </div>

        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </Card>
  );
}

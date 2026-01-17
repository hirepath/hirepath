import { Application } from '@/types/application';
import { StatusBadge } from './StatusBadge';
import { Card } from '@/components/ui/card';
import { Building2, MapPin, Calendar, ExternalLink, Bell } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface ApplicationListProps {
  applications: Application[];
  onCardClick: (app: Application) => void;
}

export function ApplicationList({ applications, onCardClick }: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">No applications yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app, index) => {
        const isFollowUpToday = app.followUpDate && isToday(new Date(app.followUpDate));
        const isFollowUpOverdue = app.followUpDate && isPast(new Date(app.followUpDate)) && !isToday(new Date(app.followUpDate));

        return (
          <Card
            key={app.id}
            onClick={() => onCardClick(app)}
            className={cn(
              'p-4 cursor-pointer card-hover bg-card border-border/50',
              'hover:border-primary/30 animate-slide-up'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{app.position}</h3>
                  <StatusBadge status={app.status} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {app.company}
                  </span>
                  {app.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {app.location}
                    </span>
                  )}
                  {app.dateApplied && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(app.dateApplied), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {(isFollowUpToday || isFollowUpOverdue) && (
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                      isFollowUpToday && 'bg-warning/10 text-warning',
                      isFollowUpOverdue && 'bg-destructive/10 text-destructive'
                    )}
                  >
                    <Bell className="h-3 w-3" />
                    {isFollowUpToday ? 'Today' : 'Overdue'}
                  </span>
                )}
                
                {app.jobUrl && (
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

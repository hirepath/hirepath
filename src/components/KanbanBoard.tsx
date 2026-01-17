import { Application, ApplicationStatus } from '@/types/application';
import { ApplicationCard } from './ApplicationCard';
import { cn } from '@/lib/utils';
import { Bookmark, Send, Users, Trophy, XCircle } from 'lucide-react';

interface KanbanBoardProps {
  applications: Application[];
  onCardClick: (app: Application) => void;
}

const columns: { status: ApplicationStatus; label: string; icon: typeof Send }[] = [
  { status: 'saved', label: 'Saved', icon: Bookmark },
  { status: 'applied', label: 'Applied', icon: Send },
  { status: 'interview', label: 'Interview', icon: Users },
  { status: 'offer', label: 'Offer', icon: Trophy },
  { status: 'rejected', label: 'Rejected', icon: XCircle }
];

const columnStyles: Record<ApplicationStatus, string> = {
  saved: 'border-t-saved',
  applied: 'border-t-primary',
  interview: 'border-t-interview',
  offer: 'border-t-success',
  rejected: 'border-t-destructive'
};

export function KanbanBoard({ applications, onCardClick }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
      {columns.map(column => {
        const columnApps = applications.filter(app => app.status === column.status);
        const Icon = column.icon;

        return (
          <div
            key={column.status}
            className={cn(
              'flex-shrink-0 w-72 md:flex-1 md:min-w-[240px]',
              'bg-muted/30 rounded-xl p-3 border-t-4',
              columnStyles[column.status]
            )}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">{column.label}</h3>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                {columnApps.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnApps.map(app => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onClick={() => onCardClick(app)}
                />
              ))}

              {columnApps.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No applications
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { Job } from '@/types/job';
import { JobCard } from './JobCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobBoardProps {
  jobs: Job[];
  savedJobs: string[];
  isLoading?: boolean;
  view?: 'grid' | 'list';
  onViewChange?: (view: 'grid' | 'list') => void;
  onJobClick?: (job: Job) => void;
  onSaveJob?: (job: Job) => void;
  onRemoveJob?: (jobId: string) => void;
  emptyMessage?: string;
}

export function JobBoard({
  jobs,
  savedJobs,
  isLoading,
  view = 'grid',
  onViewChange,
  onJobClick,
  onSaveJob,
  onRemoveJob,
  emptyMessage = 'No jobs found. Try adjusting your filters.',
}: JobBoardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="bg-card border-border/50 p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div>
      {onViewChange && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('grid')}
              className="gap-1.5"
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('list')}
              className="gap-1.5"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>
      )}

      <div
        className={cn(
          'gap-4',
          view === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'space-y-3 flex flex-col'
        )}
      >
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobs.includes(job.id)}
            onSave={() => onSaveJob?.(job)}
            onRemove={() => onRemoveJob?.(job.id)}
            onClick={() => onJobClick?.(job)}
          />
        ))}
      </div>

      {jobs.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

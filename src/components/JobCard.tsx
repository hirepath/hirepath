import { Job } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Briefcase, DollarSign, Bookmark, BookmarkCheck, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSave?: () => void;
  onRemove?: () => void;
  onClick?: () => void;
}

const levelColors: Record<string, string> = {
  entry: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  mid: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  senior: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  lead: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  executive: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

const typeColors: Record<string, string> = {
  'full-time': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'part-time': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  contract: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  internship: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  temporary: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function JobCard({ job, isSaved, onSave, onRemove, onClick }: JobCardProps) {
  const tags = job.tags || [];
  const description = job.description || "No description available.";
  const location = job.location || "Unknown location";
  const company = job.company || "Unknown company";
  const title = job.title || "Untitled job";

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-4 cursor-pointer card-hover bg-card border-border/50 animate-fade-in transition-all',
        'hover:border-primary/30 hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate text-lg">{title}</h3>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="text-sm truncate">{company}</span>
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          {isSaved ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
              className="h-8 w-8 p-0"
            >
              <BookmarkCheck className="h-4 w-4 text-primary" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onSave?.();
              }}
              className="h-8 w-8 p-0"
            >
              <Bookmark className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
            className="h-8 w-8 p-0"
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{location}</span>
          </div>

          <span className="text-xs">•</span>

          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            <span className="capitalize">{job.remote || "Unknown"}</span>
          </div>
        </div>

        {job.salaryRange && (job.salaryRange.min || job.salaryRange.max) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span>
              {job.salaryRange.min && `$${(job.salaryRange.min / 1000).toFixed(0)}k`}
              {job.salaryRange.min && job.salaryRange.max && ' - '}
              {job.salaryRange.max && `$${(job.salaryRange.max / 1000).toFixed(0)}k`}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.level && (
          <Badge variant="outline" className={cn('text-xs', levelColors[job.level] || '')}>
            {job.level}
          </Badge>
        )}

        {job.jobType && (
          <Badge variant="outline" className={cn('text-xs', typeColors[job.jobType] || '')}>
            {job.jobType}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}

        {tags.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{tags.length - 3}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Posted {job.postedDate ? formatDistanceToNow(new Date(job.postedDate), { addSuffix: true }) : "Unknown"}
        </span>

        {job.applicationCount !== undefined && (
          <span>{job.applicationCount} applicants</span>
        )}
      </div>
    </Card>
  );
}

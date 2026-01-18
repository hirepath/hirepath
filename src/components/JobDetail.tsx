import { Job, SavedJob } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Building2, MapPin, DollarSign, ExternalLink, X, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface JobDetailProps {
  job: Job | SavedJob;
  isSaved?: boolean;
  onClose: () => void;
  onSave?: () => void;
  onRemove?: () => void;
  onNotesChange?: (notes: string) => void;
  isLoading?: boolean;
}

const levelColors: Record<string, string> = {
  'entry': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'mid': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'senior': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'lead': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'executive': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

const typeColors: Record<string, string> = {
  'full-time': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'part-time': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'contract': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'internship': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'temporary': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function JobDetail({
  job,
  isSaved,
  onClose,
  onSave,
  onRemove,
  onNotesChange,
  isLoading,
}: JobDetailProps) {
  const [notes, setNotes] = useState('notes' in job ? job.notes || '' : '');

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    onNotesChange?.(newNotes);
  };

  const isSavedJob = 'savedAt' in job;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4 animate-fade-in">
      <Card className="bg-background w-full md:max-w-2xl md:rounded-lg rounded-t-lg border-0 md:border max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border/30 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{job.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="capitalize">{job.remote}</span>
            </div>
            {job.salaryRange && (job.salaryRange.min || job.salaryRange.max) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>
                  {job.salaryRange.min && `$${(job.salaryRange.min / 1000).toFixed(0)}k`}
                  {job.salaryRange.min && job.salaryRange.max && ' - '}
                  {job.salaryRange.max && `$${(job.salaryRange.max / 1000).toFixed(0)}k`}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn('text-xs', levelColors[job.level])}>
              {job.level}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', typeColors[job.jobType])}>
              {job.jobType}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Job Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>

          {job.tags && job.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {isSavedJob && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Your Notes</h3>
              <Textarea
                placeholder="Add personal notes about this job..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="min-h-24"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border/30">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => window.open(job.externalUrl, '_blank')}
              disabled={isLoading}
            >
              <ExternalLink className="h-4 w-4" />
              View on Site
            </Button>
            {isSaved ? (
              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={onRemove}
                disabled={isLoading}
              >
                <Bookmark className="h-4 w-4 fill-current" />
                Unsave
              </Button>
            ) : (
              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={onSave}
                disabled={isLoading}
              >
                <Bookmark className="h-4 w-4" />
                Save Job
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

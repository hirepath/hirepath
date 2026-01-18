import { useState, useEffect } from 'react';
import { JobBoard as JobBoardComponent } from '@/components/JobBoard';
import { JobFilters } from '@/components/JobFilters';
import { JobDetail } from '@/components/JobDetail';
import { useJobs } from '@/hooks/useJobs';
import { Job } from '@/types/job';

export function JobBoardPage() {
  const { jobs, savedJobs, isLoading, filters, fetchJobs, saveJob, removeSavedJob, updateSavedJobNotes } = useJobs();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFiltersChange = (newFilters: any) => {
    fetchJobs(newFilters);
  };

  const savedJobIds = savedJobs.map((j) => j.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Board</h1>
            <p className="text-sm text-muted-foreground">Discover and save opportunities</p>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <JobFilters filters={filters} onFiltersChange={handleFiltersChange} />
        <JobBoardComponent
          jobs={jobs}
          savedJobs={savedJobIds}
          isLoading={isLoading}
          view={view}
          onViewChange={setView}
          onJobClick={setSelectedJob}
          onSaveJob={saveJob}
          onRemoveJob={removeSavedJob}
        />
      </div>

      {selectedJob && (
        <JobDetail
          job={selectedJob}
          isSaved={savedJobIds.includes(selectedJob.id)}
          onClose={() => setSelectedJob(null)}
          onSave={() => saveJob(selectedJob)}
          onRemove={() => removeSavedJob(selectedJob.id)}
          onNotesChange={(notes) => updateSavedJobNotes(selectedJob.id, notes)}
        />
      )}
    </div>
  );
}

export default JobBoardPage;

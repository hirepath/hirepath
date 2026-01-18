import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobBoard as JobBoardComponent } from '@/components/JobBoard';
import { JobFilters } from '@/components/JobFilters';
import { JobDetail } from '@/components/JobDetail';
import { useJobs } from '@/hooks/useJobs';
import { Job } from '@/types/job';

export function JobBoardPage() {
  const navigate = useNavigate();
  const { jobs, savedJobs, isLoading, filters, fetchJobs, saveJob, removeSavedJob, updateSavedJobNotes } = useJobs();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Fetch when filters change
  useEffect(() => {
    fetchJobs(filters);
  }, [filters]);

  const handleFiltersChange = (newFilters: any) => {
    fetchJobs(newFilters);
  };

  const savedJobIds = savedJobs.map((j) => j.id);

  const filteredJobs = useMemo(() => {
    const search = (filters.search || "").toLowerCase();
    const location = (filters.location || "").toLowerCase();

    return jobs.filter((job) => {
      const title = job.title.toLowerCase();
      const company = job.company.toLowerCase();
      const loc = job.location.toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        company.includes(search);

      const matchesLocation =
        !location ||
        loc.includes(location);

      return matchesSearch && matchesLocation;
    });
  }, [jobs, filters.search, filters.location]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Board</h1>
            <p className="text-sm text-muted-foreground">Discover and save opportunities</p>
          </div>

          {/* Back Button */}
          <button
            className="btn"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <JobFilters filters={filters} onFiltersChange={handleFiltersChange} />
        <JobBoardComponent
          jobs={filteredJobs}
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
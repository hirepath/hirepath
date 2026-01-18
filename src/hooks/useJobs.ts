import { useState } from "react";
import { Job } from "@/types/job";

const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});

  const fetchJobs = async (newFilters?: any) => {
  setIsLoading(true);

  const query = newFilters?.search || "software engineer";
  const location = newFilters?.location || "Canada";

  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: "20",
    what: query,
    where: location,
  });

  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/ca/search/1?${params}`
    );

    const data = await res.json();

    const mappedJobs: Job[] = data.results.map((item: any) => ({
      id: item.id,
      title: item.title ?? "Untitled job",
      company: item.company?.display_name ?? "Unknown company",
      location: item.location?.display_name ?? "Unknown location",
      description: item.description ?? "No description available.",
      externalUrl: item.redirect_url ?? "",
      tags: item.tags ?? [],
      level: item.level ?? "",
      jobType: item.contract_type ?? "",
      remote: item.remote ?? "Unknown",
      postedDate: item.created ?? "",
      salaryRange: {
        min: item.salary_min ?? undefined,
        max: item.salary_max ?? undefined,
      },
    }));

    setJobs(mappedJobs);
    setFilters(newFilters || {});
  } catch (err) {
    console.error("Failed to fetch jobs:", err);
  } finally {
    setIsLoading(false);
  }
};


  const saveJob = (job: Job) => {
    setSavedJobs((prev) => [...prev, job]);
  };

  const removeSavedJob = (jobId: string) => {
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const updateSavedJobNotes = (jobId: string, notes: string) => {
    setSavedJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, notes } : j))
    );
  };

  return {
    jobs,
    savedJobs,
    isLoading,
    filters,
    fetchJobs,
    saveJob,
    removeSavedJob,
    updateSavedJobNotes,
  };
}

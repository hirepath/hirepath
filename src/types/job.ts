export type JobLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
export type SalaryRange = {
  min?: number;
  max?: number;
  currency?: string;
};

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  remote: 'on-site' | 'hybrid' | 'remote';
  jobType: JobType;
  level: JobLevel;
  salaryRange?: SalaryRange;
  tags: string[];
  postedDate: string;
  externalUrl: string;
  companyLogo?: string;
  applicationCount?: number;
}

export interface SavedJob extends Job {
  savedAt: string;
  notes?: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  remote?: ('on-site' | 'hybrid' | 'remote')[];
  jobType?: JobType[];
  level?: JobLevel[];
  salaryMin?: number;
  salaryMax?: number;
  tags?: string[];
}

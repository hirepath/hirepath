import { useState, useEffect } from 'react';
import { Job, SavedJob, JobFilters } from '@/types/job';

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Solutions Inc',
    description: 'We are looking for an experienced frontend developer to join our growing team. You will be responsible for building scalable web applications using React and TypeScript.\n\nRequirements:\n- 5+ years of web development experience\n- Proficiency in React, TypeScript, and modern CSS\n- Experience with web performance optimization\n- Strong problem-solving skills',
    location: 'San Francisco, CA',
    remote: 'hybrid',
    jobType: 'full-time',
    level: 'senior',
    salaryRange: {
      min: 150000,
      max: 200000,
      currency: 'USD',
    },
    tags: ['React', 'TypeScript', 'CSS', 'Web Performance'],
    postedDate: '2026-01-15T10:00:00Z',
    externalUrl: 'https://example.com/job/1',
    applicationCount: 42,
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    description: 'Join a fast-growing startup as a Full Stack Engineer. We build cutting-edge SaaS products and are looking for talented engineers who can work across our entire tech stack.\n\nWe offer:\n- Competitive salary and equity\n- Remote-first culture\n- Professional development budget',
    location: 'New York, NY',
    remote: 'remote',
    jobType: 'full-time',
    level: 'mid',
    salaryRange: {
      min: 120000,
      max: 160000,
      currency: 'USD',
    },
    tags: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
    postedDate: '2026-01-14T14:30:00Z',
    externalUrl: 'https://example.com/job/2',
    applicationCount: 58,
  },
  {
    id: '3',
    title: 'Junior Developer Internship',
    company: 'Digital Agency Pro',
    description: 'Looking for enthusiastic junior developers to join our internship program. You will work on real projects and learn from experienced developers in a supportive environment.',
    location: 'Austin, TX',
    remote: 'on-site',
    jobType: 'internship',
    level: 'entry',
    tags: ['JavaScript', 'HTML', 'CSS', 'Git'],
    postedDate: '2026-01-10T09:00:00Z',
    externalUrl: 'https://example.com/job/3',
    applicationCount: 127,
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'Cloud Systems Ltd',
    description: 'We are seeking a DevOps Engineer to help us build and maintain our cloud infrastructure. You will work with modern tools and help us scale our platform.',
    location: 'Seattle, WA',
    remote: 'hybrid',
    jobType: 'full-time',
    level: 'senior',
    salaryRange: {
      min: 160000,
      max: 210000,
      currency: 'USD',
    },
    tags: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    postedDate: '2026-01-13T11:00:00Z',
    externalUrl: 'https://example.com/job/4',
    applicationCount: 23,
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'Analytics Corp',
    description: 'Join our data science team and help drive insights from large datasets. You will work with Python, machine learning, and big data technologies.',
    location: 'Remote',
    remote: 'remote',
    jobType: 'full-time',
    level: 'mid',
    salaryRange: {
      min: 130000,
      max: 180000,
      currency: 'USD',
    },
    tags: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
    postedDate: '2026-01-12T16:45:00Z',
    externalUrl: 'https://example.com/job/5',
    applicationCount: 35,
  },
  {
    id: '6',
    title: 'UI/UX Designer',
    company: 'Creative Studio',
    description: 'We are looking for a talented UI/UX designer to create beautiful and intuitive user experiences for our mobile and web applications.',
    location: 'Los Angeles, CA',
    remote: 'hybrid',
    jobType: 'full-time',
    level: 'mid',
    tags: ['Figma', 'UI Design', 'User Research', 'Prototyping'],
    postedDate: '2026-01-11T13:20:00Z',
    externalUrl: 'https://example.com/job/6',
    applicationCount: 29,
  },
];

const SAVED_JOBS_KEY = 'hirepath_saved_jobs';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({});

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_JOBS_KEY);
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved jobs:', error);
      }
    }
  }, []);

  const fetchJobs = async (filterParams: JobFilters = {}) => {
    setIsLoading(true);
    try {
      // Minimal delay for a more responsive feel
      await new Promise((resolve) => setTimeout(resolve, 50));

      let filtered = [...mockJobs];

      if (filterParams.search) {
        const search = filterParams.search.toLowerCase();
        filtered = filtered.filter(
          (job) =>
            job.title.toLowerCase().includes(search) ||
            job.company.toLowerCase().includes(search) ||
            job.description.toLowerCase().includes(search)
        );
      }

      if (filterParams.location) {
        const location = filterParams.location.toLowerCase();
        filtered = filtered.filter((job) =>
          job.location.toLowerCase().includes(location)
        );
      }

      if (filterParams.remote?.length) {
        filtered = filtered.filter((job) => filterParams.remote!.includes(job.remote));
      }

      if (filterParams.jobType?.length) {
        filtered = filtered.filter((job) => filterParams.jobType!.includes(job.jobType));
      }

      if (filterParams.level?.length) {
        filtered = filtered.filter((job) => filterParams.level!.includes(job.level));
      }

      setJobs(filtered);
      setFilters(filterParams);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveJob = (job: Job, notes?: string) => {
    const alreadySaved = savedJobs.find((j) => j.id === job.id);
    if (alreadySaved) return;

    const savedJob: SavedJob = {
      ...job,
      savedAt: new Date().toISOString(),
      notes: notes || '',
    };

    const updated = [...savedJobs, savedJob];
    setSavedJobs(updated);
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
  };

  const removeSavedJob = (jobId: string) => {
    const updated = savedJobs.filter((job) => job.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
  };

  const updateSavedJobNotes = (jobId: string, notes: string) => {
    const updated = savedJobs.map((job) =>
      job.id === jobId ? { ...job, notes } : job
    );
    setSavedJobs(updated);
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
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

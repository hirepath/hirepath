import { useState, useEffect } from 'react';
import { Application, MasterResume, Communication } from '@/types/application';

const STORAGE_KEY = 'hirepath_applications';
const RESUME_KEY = 'hirepath_resume';

const sampleApplications: Application[] = [
  {
    id: '1',
    company: 'TechCorp Inc',
    position: 'Senior Frontend Developer',
    location: 'San Francisco, CA (Remote)',
    salary: '$150,000 - $180,000',
    status: 'interview',
    dateApplied: '2026-01-10',
    followUpDate: '2026-01-20',
    jobUrl: 'https://example.com/job1',
    notes: 'Great company culture, interviewed with the engineering team lead.',
    communications: [
      { id: 'c1', date: '2026-01-12', type: 'email', content: 'Received confirmation of application' },
      { id: 'c2', date: '2026-01-15', type: 'call', content: 'Phone screen with HR - went well!' }
    ],
    resumeVersion: 'Frontend focused version',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-15T14:30:00Z'
  },
  {
    id: '2',
    company: 'StartupXYZ',
    position: 'Full Stack Engineer',
    location: 'New York, NY',
    salary: '$130,000 - $160,000',
    status: 'applied',
    dateApplied: '2026-01-14',
    followUpDate: '2026-01-21',
    jobUrl: 'https://example.com/job2',
    notes: 'Interesting product, early stage startup with good funding.',
    communications: [],
    createdAt: '2026-01-14T09:00:00Z',
    updatedAt: '2026-01-14T09:00:00Z'
  },
  {
    id: '3',
    company: 'BigTech Global',
    position: 'Software Engineer III',
    location: 'Seattle, WA',
    salary: '$175,000 - $220,000',
    status: 'offer',
    dateApplied: '2026-01-05',
    notes: 'Received offer! Need to respond by end of week.',
    communications: [
      { id: 'c3', date: '2026-01-08', type: 'meeting', content: 'Technical interview - 4 rounds' },
      { id: 'c4', date: '2026-01-12', type: 'email', content: 'Received offer letter!' }
    ],
    resumeVersion: 'General tech version',
    createdAt: '2026-01-05T11:00:00Z',
    updatedAt: '2026-01-12T16:00:00Z'
  },
  {
    id: '4',
    company: 'FinanceApp Co',
    position: 'React Developer',
    location: 'Chicago, IL (Hybrid)',
    status: 'rejected',
    dateApplied: '2026-01-03',
    notes: 'Position was filled internally.',
    communications: [
      { id: 'c5', date: '2026-01-10', type: 'email', content: 'Received rejection email' }
    ],
    createdAt: '2026-01-03T08:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: '5',
    company: 'CloudServices Inc',
    position: 'Frontend Architect',
    location: 'Austin, TX (Remote)',
    salary: '$180,000 - $200,000',
    status: 'saved',
    dateApplied: '',
    notes: 'Great opportunity, need to tailor resume before applying.',
    communications: [],
    createdAt: '2026-01-16T10:00:00Z',
    updatedAt: '2026-01-16T10:00:00Z'
  }
];

const defaultResume: MasterResume = {
  content: `# Your Name
your.email@example.com | (555) 123-4567 | LinkedIn | GitHub

## Summary
Experienced software developer with expertise in modern web technologies...

## Experience
### Senior Developer | Company Name | 2022 - Present
- Led development of key features...
- Mentored junior developers...

### Developer | Previous Company | 2019 - 2022
- Built and maintained web applications...
- Collaborated with cross-functional teams...

## Education
### Bachelor of Science in Computer Science
University Name | 2019

## Skills
JavaScript, TypeScript, React, Node.js, Python, SQL, Git, AWS`,
  lastUpdated: new Date().toISOString()
};

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [resume, setResume] = useState<MasterResume>(defaultResume);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setApplications(JSON.parse(stored));
    } else {
      setApplications(sampleApplications);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleApplications));
    }

    const storedResume = localStorage.getItem(RESUME_KEY);
    if (storedResume) {
      setResume(JSON.parse(storedResume));
    } else {
      localStorage.setItem(RESUME_KEY, JSON.stringify(defaultResume));
    }

    setIsLoading(false);
  }, []);

  const saveApplications = (apps: Application[]) => {
    setApplications(apps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  };

  const addApplication = (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'communications'>) => {
    const newApp: Application = {
      ...app,
      id: crypto.randomUUID(),
      communications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveApplications([newApp, ...applications]);
    return newApp;
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    const updated = applications.map(app =>
      app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
    );
    saveApplications(updated);
  };

  const deleteApplication = (id: string) => {
    saveApplications(applications.filter(app => app.id !== id));
  };

  const addCommunication = (appId: string, comm: Omit<Communication, 'id'>) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      const newComm = { ...comm, id: crypto.randomUUID() };
      updateApplication(appId, {
        communications: [...app.communications, newComm]
      });
    }
  };

  const updateResume = (content: string) => {
    const updated = { content, lastUpdated: new Date().toISOString() };
    setResume(updated);
    localStorage.setItem(RESUME_KEY, JSON.stringify(updated));
  };

  return {
    applications,
    resume,
    isLoading,
    addApplication,
    updateApplication,
    deleteApplication,
    addCommunication,
    updateResume
  };
}

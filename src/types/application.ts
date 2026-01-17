export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export interface Communication {
  id: string;
  date: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  content: string;
}

export interface Application {
  id: string;
  company: string;
  position: string;
  location: string;
  salary?: string;
  status: ApplicationStatus;
  dateApplied: string;
  followUpDate?: string;
  jobUrl?: string;
  notes: string;
  communications: Communication[];
  resumeVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MasterResume {
  content: string;
  lastUpdated: string;
}

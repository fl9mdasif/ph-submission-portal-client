export type TCreateSubmission = {
  projectName: string;
  repoUrl: string;
  liveLink?: string;
  description: string;
};

export type TUpdateSubmissionStatus = {
  status: 'APPROVED' | 'REJECTED';
  feedback?: string;
};

export type TSubmissionFilters = {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
};

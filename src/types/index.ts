export type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  meta?: TMeta;
  data: T;
};

export type TApiError = {
  status?: number | string;
  data?: {
    message?: string;
    errorDetails?: unknown;
  };
};

export type TRole = "STUDENT" | "MENTOR";
export type TSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type TUser = {
  id: string;
  name: string;
  email: string;
  role: TRole;
};

export type TJwtPayload = {
  id: string;
  email: string;
  role: TRole;
  name: string;
  iat?: number;
  exp?: number;
};

export type TSubmission = {
  id: string;
  assignmentNumber: number;
  projectName: string;
  repoUrl: string;
  liveLink?: string | null;
  description: string;
  status: TSubmissionStatus;
  feedback?: string | null;
  edited: boolean;
  studentId: string;
  student: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
};

export type TSubmissionStats = {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  total: number;
};

export type TActivityLog = {
  id: string;
  mentorId: string;
  submissionId: string;
  action: "APPROVED_SUBMISSION" | "REJECTED_SUBMISSION";
  detail?: string | null;
  createdAt: string;
};

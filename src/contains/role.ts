// Must mirror the server's Role enum exactly (server/prisma/schema.prisma)
export const USER_ROLE = {
  STUDENT: "STUDENT",
  MENTOR: "MENTOR",
} as const;

export const SUBMISSION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

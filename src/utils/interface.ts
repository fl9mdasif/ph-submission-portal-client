import { z } from "zod";

// Mirrors server/src/app/modules/auth/validation.auth.ts exactly
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ASSIGNMENT_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1);

// Mirrors server/src/app/modules/submission/validation.submission.ts exactly
export const createSubmissionSchema = z.object({
  assignmentNumber: z
    .number({ message: "Select an assignment number" })
    .int()
    .min(1, "Select an assignment number")
    .max(15, "Assignment number must be between 1 and 15"),
  projectName: z.string().trim().min(3, "Project name must be at least 3 characters"),
  repoUrl: z
    .string()
    .url("Must be a valid URL")
    .regex(/github\.com|gitlab\.com|bitbucket\.org/, "Must be a GitHub, GitLab, or Bitbucket URL"),
  liveLink: z.union([z.string().url("Must be a valid URL"), z.literal("")]).optional(),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
});

export type TRegisterFormValues = z.infer<typeof registerSchema>;
export type TLoginFormValues = z.infer<typeof loginSchema>;
export type TSignupFormValues = z.infer<typeof signupFormSchema>;
export type TCreateSubmissionFormValues = z.infer<typeof createSubmissionSchema>;

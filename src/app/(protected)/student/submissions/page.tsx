"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Clock, CheckCircle2, XCircle, ExternalLink, Pencil, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { removeUser } from "@/services/auth.services";
import { AppShell } from "@/components/app-shell";
import { useEditSubmissionMutation, useGetMySubmissionsQuery } from "@/redux/api/submissionApi";
import { ASSIGNMENT_NUMBERS, createSubmissionSchema, TCreateSubmissionFormValues } from "@/utils/interface";
import { TSubmission, TSubmissionStatus } from "@/types";

const STATUS_CONFIG: Record<TSubmissionStatus, { label: string; className: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-700", icon: Clock },
  APPROVED: { label: "Approved", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", className: "border-rose-200 bg-rose-50 text-rose-700", icon: XCircle },
};

export default function MySubmissionsPage() {
  const router = useRouter();
  const { user, checking } = useAuthGuard(["STUDENT"]);
  const { data: submissions, isLoading } = useGetMySubmissionsQuery(undefined, { skip: checking });
  const [editing, setEditing] = useState<TSubmission | null>(null);
  const [editSubmission, { isLoading: isSaving }] = useEditSubmissionMutation();

  const form = useForm<TCreateSubmissionFormValues>({
    resolver: zodResolver(createSubmissionSchema),
  });

  const openEdit = (submission: TSubmission) => {
    setEditing(submission);
    form.reset({
      assignmentNumber: submission.assignmentNumber,
      projectName: submission.projectName,
      repoUrl: submission.repoUrl,
      liveLink: submission.liveLink || "",
      description: submission.description,
    });
  };

  const onSaveEdit = async (values: TCreateSubmissionFormValues) => {
    if (!editing) return;
    try {
      await editSubmission({ id: editing.id, ...values, liveLink: values.liveLink || undefined }).unwrap();
      toast.success("Submission updated — sent back for re-review");
      setEditing(null);
    } catch (err) {
      const apiErr = err as { status?: number; data?: { message?: string } };
      toast.error(apiErr.data?.message || "Update failed");
    }
  };

  const handleLogout = () => {
    removeUser();
    router.push("/login");
  };

  if (checking || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <AppShell name={user.name} role="STUDENT" onLogout={handleLogout}>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Track the status of everything you&apos;ve submitted. Each one can be edited once.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>#</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Repo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : submissions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    You haven&apos;t submitted anything yet.
                  </TableCell>
                </TableRow>
              ) : (
                submissions?.map((s) => {
                  const status = STATUS_CONFIG[s.status];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.assignmentNumber}</TableCell>
                      <TableCell className="max-w-48 truncate">{s.projectName}</TableCell>
                      <TableCell>
                        <a
                          href={s.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Repo <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${status.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-56 truncate text-sm text-muted-foreground">
                        {s.feedback || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.edited ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" /> Edited
                          </span>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(s)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit submission</DialogTitle>
            <DialogDescription>
              This is your one-time edit. Saving will send this back to Pending for re-review.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaveEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="assignmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment number</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASSIGNMENT_NUMBERS.map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            Assignment {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="liveLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live link</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

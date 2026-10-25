"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetSubmissionsQuery,
  useGetSubmissionStatsQuery,
  useUpdateSubmissionStatusMutation,
} from "@/redux/api/submissionApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { removeUser } from "@/services/auth.services";
import { TSubmissionStatus } from "@/types";
import { AppHeader } from "@/components/app-header";

const STATUS_CONFIG: Record<
  TSubmissionStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  PENDING: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50",
    icon: XCircle,
  },
};

const STAT_CARDS: {
  key: TSubmissionStatus;
  label: string;
  icon: typeof Clock;
  accent: string;
}[] = [
  { key: "PENDING", label: "Total Pending", icon: Clock, accent: "text-amber-600 bg-amber-50" },
  {
    key: "APPROVED",
    label: "Total Approved",
    icon: CheckCircle2,
    accent: "text-emerald-600 bg-emerald-50",
  },
  { key: "REJECTED", label: "Total Rejected", icon: XCircle, accent: "text-rose-600 bg-rose-50" },
];

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const LIMIT = 10;

export default function MentorPage() {
  const router = useRouter();
  const { user, checking } = useAuthGuard(["MENTOR"]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TSubmissionStatus | "ALL">("ALL");

  const { data: statsData, isLoading: statsLoading } = useGetSubmissionStatsQuery(undefined, {
    skip: checking,
  });

  const { data: listData, isLoading: listLoading, isFetching } = useGetSubmissionsQuery(
    {
      page,
      limit: LIMIT,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    },
    { skip: checking },
  );

  const [updateStatus, { isLoading: isUpdating }] = useUpdateSubmissionStatusMutation();

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Submission ${status === "APPROVED" ? "approved" : "rejected"}`);
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  const handleLogout = () => {
    removeUser();
    router.push("/login");
  };

  if (checking || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const totalPages = listData?.meta?.totalPages ?? 1;
  const total = statsData?.total ?? 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader name={user.name} role="MENTOR" onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {total} submission{total === 1 ? "" : "s"} total · review and respond to student work
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STAT_CARDS.map(({ key, label, icon: Icon, accent }) => (
            <Card key={key} className="border-muted-foreground/10 shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  {statsLoading ? (
                    <Skeleton className="mt-1.5 h-8 w-12" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold tabular-nums">{statsData?.[key] ?? 0}</p>
                  )}
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-muted-foreground/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b [.border-b]:pb-4">
            <CardTitle className="text-base">Submissions</CardTitle>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as TSubmissionStatus | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44 gap-1.5">
                <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Project</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listLoading || isFetching ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : listData?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No submissions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    listData?.data.map((submission) => {
                      const status = STATUS_CONFIG[submission.status];
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={submission.id}>
                          <TableCell className="max-w-56 truncate font-medium">
                            {submission.projectName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                  {initialsOf(submission.student.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="leading-tight">
                                <div className="text-sm font-medium">{submission.student.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {submission.student.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 text-sm">
                              <a
                                href={submission.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                Repo <ExternalLink className="h-3 w-3" />
                              </a>
                              {submission.liveLink && (
                                <a
                                  href={submission.liveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                  Live <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1 ${status.className}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {submission.status === "PENDING" ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  disabled={isUpdating}
                                  onClick={() => handleAction(submission.id, "APPROVED")}
                                  className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={isUpdating}
                                  onClick={() => handleAction(submission.id, "REJECTED")}
                                  className="gap-1"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Reviewed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

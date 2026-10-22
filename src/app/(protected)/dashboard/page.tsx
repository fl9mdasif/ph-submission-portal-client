"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

const STATUS_BADGE: Record<TSubmissionStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  APPROVED: "bg-green-100 text-green-800 hover:bg-green-100",
  REJECTED: "bg-red-100 text-red-800 hover:bg-red-100",
};

const LIMIT = 10;

export default function DashboardPage() {
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

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const totalPages = listData?.meta?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-muted/40 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Review Dashboard</h1>
            <p className="text-sm text-muted-foreground">Signed in as {user?.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-yellow-600">{statsData?.PENDING ?? 0}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-green-600">{statsData?.APPROVED ?? 0}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-red-600">{statsData?.REJECTED ?? 0}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Submissions</CardTitle>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as TSubmissionStatus | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
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
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Repo</TableHead>
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  listData?.data.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.projectName}</TableCell>
                      <TableCell>
                        <div className="text-sm">{submission.student.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {submission.student.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={submission.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 underline"
                        >
                          Repo
                        </a>
                        {submission.liveLink && (
                          <>
                            {" · "}
                            <a
                              href={submission.liveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 underline"
                            >
                              Live
                            </a>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_BADGE[submission.status]}>
                          {submission.status}
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
                              variant="default"
                              disabled={isUpdating}
                              onClick={() => handleAction(submission.id, "APPROVED")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isUpdating}
                              onClick={() => handleAction(submission.id, "REJECTED")}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Reviewed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

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
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

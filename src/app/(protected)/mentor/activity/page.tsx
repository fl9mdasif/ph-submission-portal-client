"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { removeUser } from "@/services/auth.services";
import { AppShell } from "@/components/app-shell";
import { useGetMentorActivityQuery } from "@/redux/api/submissionApi";

const LIMIT = 15;

export default function MentorActivityPage() {
  const router = useRouter();
  const { user, checking } = useAuthGuard(["MENTOR"]);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetMentorActivityQuery(
    { page, limit: LIMIT },
    { skip: checking },
  );

  const handleLogout = () => {
    removeUser();
    router.push("/login");
  };

  if (checking || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <AppShell name={user.name} role="MENTOR" onLogout={handleLogout}>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Activity Log</h1>
          <p className="text-sm text-muted-foreground">
            A record of every approve/reject action you&apos;ve taken.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Action</TableHead>
                <TableHead>Submission</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 3 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                    No activity yet.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((log) => {
                  const approved = log.action === "APPROVED_SUBMISSION";
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            approved
                              ? "gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "gap-1 border-rose-200 bg-rose-50 text-rose-700"
                          }
                        >
                          {approved ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {approved ? "Approved" : "Rejected"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.detail}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
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
      </div>
    </AppShell>
  );
}

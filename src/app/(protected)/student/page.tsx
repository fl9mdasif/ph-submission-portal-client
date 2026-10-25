"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GitBranch, Globe, FileText, FolderGit2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateSubmissionMutation } from "@/redux/api/submissionApi";
import { createSubmissionSchema, TCreateSubmissionFormValues } from "@/utils/interface";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { removeUser } from "@/services/auth.services";
import { AppHeader } from "@/components/app-header";

export default function StudentPage() {
  const router = useRouter();
  const { user, checking } = useAuthGuard(["STUDENT"]);
  const [createSubmission, { isLoading }] = useCreateSubmissionMutation();

  const form = useForm<TCreateSubmissionFormValues>({
    resolver: zodResolver(createSubmissionSchema),
    defaultValues: { projectName: "", repoUrl: "", liveLink: "", description: "" },
  });

  const onSubmit = async (values: TCreateSubmissionFormValues) => {
    try {
      await createSubmission({
        ...values,
        liveLink: values.liveLink || undefined,
      }).unwrap();
      toast.success("Project submitted successfully");
      form.reset();
    } catch (err) {
      const apiErr = err as { status?: number; data?: { message?: string } };
      if (apiErr.status === 409) {
        toast.error("You have already submitted this repository");
      } else if (apiErr.status === 429) {
        toast.error("Too many submissions. Please wait before trying again.");
      } else {
        toast.error(apiErr.data?.message || "Submission failed");
      }
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
    <div className="min-h-screen bg-muted/30">
      <AppHeader name={user.name} role="STUDENT" onLogout={handleLogout} />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Submit your project</h1>
          <p className="text-sm text-muted-foreground">
            Share your work for mentor review. Each repository can only be submitted once.
          </p>
        </div>

        <Card className="border-muted-foreground/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Project details</CardTitle>
            <CardDescription>Fields marked with an asterisk are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FolderGit2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="My Awesome Project" className="pl-9" {...field} />
                        </div>
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
                      <FormLabel>Repository URL *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <GitBranch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="https://github.com/you/project"
                            className="pl-9"
                            {...field}
                          />
                        </div>
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
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="https://my-project.vercel.app"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Optional — a deployed preview of your project.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            placeholder="What does this project do? What problem does it solve?"
                            className="min-h-24 pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>At least 20 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gap-1.5" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit project"}
                  {!isLoading && <Send className="h-4 w-4" />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

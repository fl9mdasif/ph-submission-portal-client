"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateSubmissionMutation } from "@/redux/api/submissionApi";
import { createSubmissionSchema, TCreateSubmissionFormValues } from "@/utils/interface";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { removeUser } from "@/services/auth.services";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
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

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Signed in as {user?.name}</p>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Submit your project</CardTitle>
            <CardDescription>
              Fill in the details below for mentor review. Each repository can only be submitted once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Project" {...field} />
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
                        <Input placeholder="https://github.com/you/project" {...field} />
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
                      <FormLabel>Live link (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://my-project.vercel.app" {...field} />
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
                        <Input placeholder="What does this project do?" {...field} />
                      </FormControl>
                      <FormDescription>At least 20 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit project"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

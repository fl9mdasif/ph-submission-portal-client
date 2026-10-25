"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LayoutDashboard, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/redux/api/authApi";
import { loginSchema, TLoginFormValues } from "@/utils/interface";
import { isLoggedIn, getUserInfo, storeUserInfo } from "@/services/auth.services";
import { TJwtPayload } from "@/types";
import { ROLE_HOME_ROUTE } from "@/contains/role";

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<TLoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isLoggedIn()) {
      const info = getUserInfo() as TJwtPayload;
      router.replace(ROLE_HOME_ROUTE[info.role]);
    }
  }, [router]);

  const onSubmit = async (values: TLoginFormValues) => {
    try {
      const result = await login(values).unwrap();
      storeUserInfo({ accessToken: result.accessToken });
      toast.success("Login successful");
      router.push(ROLE_HOME_ROUTE[result.user.role]);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message || "Invalid email or password";
      toast.error(message);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">PH Submission Portal</span>
        </div>
        <div className="relative space-y-4">
          <h1 className="text-3xl font-semibold leading-tight">
            Submit your projects.
            <br />
            Get reviewed by mentors.
          </h1>
          <p className="max-w-sm text-sm text-primary-foreground/80">
            A streamlined dashboard for students to submit projects and mentors to review,
            approve, or request changes — all in one place.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/60">
          Programming Hero · Project Submission &amp; Review Dashboard
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1.5 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Log in to continue to your workspace
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full gap-1.5" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log in"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            New student?{" "}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

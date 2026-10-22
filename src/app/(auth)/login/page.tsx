"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginMutation } from "@/redux/api/authApi";
import { loginSchema, TLoginFormValues } from "@/utils/interface";
import { isLoggedIn, getUserInfo, storeUserInfo } from "@/services/auth.services";
import { TJwtPayload } from "@/types";

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
      router.replace(info.role === "MENTOR" ? "/dashboard" : "/submit");
    }
  }, [router]);

  const onSubmit = async (values: TLoginFormValues) => {
    try {
      const result = await login(values).unwrap();
      storeUserInfo({ accessToken: result.accessToken });
      toast.success("Login successful");
      router.push(result.user.role === "MENTOR" ? "/dashboard" : "/submit");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message || "Invalid email or password";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Access the submission portal</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Student?{" "}
            <Link href="/signup" className="underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

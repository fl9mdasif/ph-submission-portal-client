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
import { useRegisterMutation } from "@/redux/api/authApi";
import { signupFormSchema, TSignupFormValues } from "@/utils/interface";
import { isLoggedIn, getUserInfo } from "@/services/auth.services";
import { TJwtPayload } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const form = useForm<TSignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (isLoggedIn()) {
      const info = getUserInfo() as TJwtPayload;
      router.replace(info.role === "MENTOR" ? "/dashboard" : "/submit");
    }
  }, [router]);

  const onSubmit = async (values: TSignupFormValues) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap();
      toast.success("Account created. Please log in.");
      router.push("/login");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message || "Registration failed";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create a student account</CardTitle>
          <CardDescription>Submit your projects for mentor review</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUserInfo } from "@/services/auth.services";
import { TJwtPayload } from "@/types";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      const info = getUserInfo() as TJwtPayload;
      router.replace(info.role === "MENTOR" ? "/dashboard" : "/submit");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return <div className="flex min-h-screen items-center justify-center">Redirecting...</div>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUserInfo } from "@/services/auth.services";
import { TJwtPayload } from "@/types";
import { ROLE_HOME_ROUTE } from "@/contains/role";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      const info = getUserInfo() as TJwtPayload;
      router.replace(ROLE_HOME_ROUTE[info.role]);
    } else {
      router.replace("/login");
    }
  }, [router]);

  return <div className="flex min-h-screen items-center justify-center">Redirecting...</div>;
}

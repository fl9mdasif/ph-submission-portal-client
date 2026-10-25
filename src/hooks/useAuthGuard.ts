"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo, isLoggedIn } from "@/services/auth.services";
import { TJwtPayload, TRole } from "@/types";
import { ROLE_HOME_ROUTE } from "@/contains/role";

export const useAuthGuard = (allowedRoles: TRole[]) => {
  const router = useRouter();
  const [user, setUser] = useState<TJwtPayload | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    const info = getUserInfo() as TJwtPayload;
    if (!allowedRoles.includes(info.role)) {
      router.replace(ROLE_HOME_ROUTE[info.role]);
      return;
    }

    setUser(info);
    setChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, checking };
};

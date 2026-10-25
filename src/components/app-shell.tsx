"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

type AppShellProps = {
  name: string;
  role: "STUDENT" | "MENTOR";
  onLogout: () => void;
  children: ReactNode;
};

export function AppShell({ name, role, onLogout, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AppSidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader name={name} role={role} onLogout={onLogout} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

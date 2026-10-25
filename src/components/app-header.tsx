"use client";

import { LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

type AppHeaderProps = {
  name: string;
  role: "STUDENT" | "MENTOR";
  onLogout: () => void;
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppHeader({ name, role, onLogout }: AppHeaderProps) {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-background/80 sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">PH Submission Portal</p>
            <p className="text-xs text-muted-foreground">
              {role === "MENTOR" ? "Review Dashboard" : "Student Workspace"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initialsOf(name)}
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}

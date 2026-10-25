"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, ListChecks, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: typeof Send };

const STUDENT_NAV: NavItem[] = [
  { label: "Submit Project", href: "/student", icon: Send },
  { label: "My Submissions", href: "/student/submissions", icon: ListChecks },
];

const MENTOR_NAV: NavItem[] = [
  { label: "Review Dashboard", href: "/mentor", icon: LayoutDashboard },
  { label: "Activity Log", href: "/mentor/activity", icon: Activity },
];

export function AppSidebar({ role }: { role: "STUDENT" | "MENTOR" }) {
  const pathname = usePathname();
  const items = role === "MENTOR" ? MENTOR_NAV : STUDENT_NAV;

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-white/60 dark:bg-background/60 sm:block">
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">PH Portal</span>
      </div>
      <nav className="space-y-1 p-3">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

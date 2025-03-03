"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "ダッシュボード",
      href: "/dashboard",
    },
    {
      name: "ヒアリング管理",
      href: "/dashboard/hearings",
    },
    {
      name: "募集要項",
      href: "/dashboard/job-descriptions",
    },
    {
      name: "テンプレート",
      href: "/dashboard/templates",
    },
    {
      name: "AI設定",
      href: "/dashboard/ai-settings",
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-xl">
            募集要項生成システム
          </Link>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

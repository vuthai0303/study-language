"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Trang chủ",
      active: pathname === "/",
    },
    {
      href: "/vocabulary",
      label: "Học từ vựng",
      active: pathname === "/vocabulary",
    },
    {
      href: "/writing",
      label: "Học viết",
      active: pathname === "/writing",
    },
    {
      href: "/grammar",
      label: "Học ngữ pháp",
      active: pathname === "/grammar",
    },
    {
      href: "/reading",
      label: "Luyện đọc",
      active: pathname === "/reading",
    },
    {
      href: "/listening",
      label: "Học nghe",
      active: pathname === "/listening",
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}

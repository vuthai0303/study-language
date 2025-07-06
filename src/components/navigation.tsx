"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
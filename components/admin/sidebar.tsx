"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/admin/nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-6 text-lg font-semibold text-primary">FujahBuzz</div>
      <nav aria-label="Admin" className="flex-1">
        <ul>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 text-sm font-medium transition-colors",
                    active
                      ? "bg-gradient-to-b from-indigo-depth/90 to-transparent font-semibold"
                      : "hover:bg-muted",
                  )}
                >
                  <Icon className="size-6" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-4 px-6 py-4 text-sm font-medium hover:bg-muted"
      >
        <LogOut className="size-6" aria-hidden />
        Sign out
      </button>
    </aside>
  );
}

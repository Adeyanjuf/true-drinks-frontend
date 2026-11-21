import {
  LayoutDashboard,
  Network,
  ShoppingCart,
  Store,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

// Add an entry here when a section ships, so the menu never links to a missing page.
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Store },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Category", href: "/admin/categories", icon: Network },
];

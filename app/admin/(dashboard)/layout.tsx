import { requireAdmin } from "@/lib/auth/admin";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}

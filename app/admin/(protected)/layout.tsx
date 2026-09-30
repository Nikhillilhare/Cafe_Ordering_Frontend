import type { ReactNode } from "react";

import AdminShell from "@/app/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const admin = await requireAdminPage();

  return (
    <AdminShell
      admin={{
        name: admin.name,
        role: admin.role,
      }}
      cafe={{
        name: admin.cafe.name,
        slug: admin.cafe.slug,
      }}
    >
      {children}
    </AdminShell>
  );
}
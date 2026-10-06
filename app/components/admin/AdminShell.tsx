"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import AdminHeader from "./AdminHeader";
import AdminPageTransition from "./AdminPageTransition";
import AdminSidebar from "./AdminSidebar";

type AdminShellProps = {
  children: ReactNode;

  admin: {
    name: string;
    role: string;
  };

  cafe: {
    name: string;
    slug: string;
  };
};

export default function AdminShell({
  children,
  admin,
  cafe,
}: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mobileNavigationOpen, setMobileNavigationOpen] =
    useState(false);

 return (
  <div className="flex min-h-screen">
    <AdminSidebar
      cafeName={cafe.name}
      adminName={admin.name}
      adminRole={admin.role}
      collapsed={sidebarCollapsed}
      mobileOpen={mobileNavigationOpen}
      onCollapsedChange={setSidebarCollapsed}
      onMobileClose={() => setMobileNavigationOpen(false)}
    />

    <div className="flex min-w-0 flex-1 flex-col">
      <AdminHeader
        cafeName={cafe.name}
        cafeSlug={cafe.slug}
        adminName={admin.name}
        adminRole={admin.role}
        onOpenMobileNavigation={() =>
          setMobileNavigationOpen(true)
        }
      />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto w-full max-w-[1500px]">
          <AdminPageTransition>
            {children}
          </AdminPageTransition>
        </div>
      </main>
    </div>
  </div>
);
}
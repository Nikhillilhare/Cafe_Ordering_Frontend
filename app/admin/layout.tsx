import type { Metadata } from "next";
import type { ReactNode } from "react";

import AdminBackground from "@/app/components/admin/AdminBackground";

export const metadata: Metadata = {
  title: {
    default: "Cafe Admin",
    template: "%s | Cafe Admin",
  },
  description: "Cafe ordering platform administration panel.",
};

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return <AdminBackground>{children}</AdminBackground>;
}
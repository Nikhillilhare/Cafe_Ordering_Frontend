import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Coffee,
  LayoutDashboard,
  ReceiptText,
  Sparkles,
} from "lucide-react";

import AdminLoginForm from "@/app/components/admin/AdminLoginForm";
import { getAuthenticatedAdmin } from "@/lib/auth/requireAdmin";

export const metadata: Metadata = {
  title: "Admin Login",
};

const features = [
  {
    icon: LayoutDashboard,
    title: "Live dashboard",
    description: "Monitor orders, payments and cafe activity.",
  },
  {
    icon: ReceiptText,
    title: "Order management",
    description: "Track every customer order from one workspace.",
  },
  {
    icon: Sparkles,
    title: "Cafe customization",
    description: "Manage your menu, categories and cafe settings.",
  },
];

export default async function AdminLoginPage() {
  const existingAdmin = await getAuthenticatedAdmin();

  if (existingAdmin) {
    redirect("/admin");
  }

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden flex-col justify-between px-12 py-14 lg:flex xl:px-16">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-950/40">
                <Coffee className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="font-bold text-white">
                  Cafe Ordering Platform
                </p>

                <p className="text-sm text-slate-500">
                  Multi-tenant administration
                </p>
              </div>
            </div>

            <div className="mt-24 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200">
                <Sparkles className="h-4 w-4" />
                Built for modern cafe operations
              </div>

              <h2 className="mt-7 text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">
                Run your cafe from one{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                  intelligent workspace.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Manage customer orders, menu availability and payment
                activity without mixing data between different cafes.
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.07]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 transition group-hover:scale-110 group-hover:bg-indigo-500/20">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/40">
                <Coffee className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="font-bold text-white">
                  Cafe Ordering Platform
                </p>

                <p className="text-xs text-slate-500">
                  Secure admin portal
                </p>
              </div>
            </div>

            <AdminLoginForm />

            <p className="mt-6 text-center text-xs text-slate-600">
              Protected by encrypted credentials and signed sessions.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
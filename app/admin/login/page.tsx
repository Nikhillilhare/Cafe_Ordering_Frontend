import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  Sparkles,
} from "lucide-react";

import AdminLoginForm from "@/app/components/admin/AdminLoginForm";
import {
  CoffeeBeansArtwork,
  CoffeeCupArtwork,
} from "@/app/components/admin/CoffeeArtwork";
import { getAuthenticatedAdmin } from "@/lib/auth/requireAdmin";

export const metadata: Metadata = {
  title: "Admin Login",
};

const features = [
  {
    icon: LayoutDashboard,
    title: "Live dashboard",
    description:
      "Monitor cafe orders and payment activity.",
  },
  {
    icon: ReceiptText,
    title: "Order management",
    description:
      "Track every customer order in one place.",
  },
  {
    icon: Sparkles,
    title: "Cafe customization",
    description:
      "Manage menu items, categories and branding.",
  },
];

export default async function AdminLoginPage() {
  const existingAdmin =
    await getAuthenticatedAdmin();

  if (existingAdmin) {
    redirect("/admin");
  }

  return (
   <main className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#F1E2D5_0%,#E6C9B3_48%,#D9B294_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl overflow-hidden rounded-[2rem] border border-[#e1c9b7] bg-white/45 shadow-[0_28px_80px_rgba(72,31,10,0.16)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#2a1007_0%,#54220e_52%,#1d0b05_100%)] px-10 py-10 lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <CoffeeBeansArtwork className="absolute -right-44 -top-16 h-80 w-[38rem] rotate-12 opacity-40" />

            <CoffeeBeansArtwork className="absolute -bottom-24 -left-36 h-80 w-[38rem] -rotate-12 opacity-25" />

            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#5e2710]/10 to-black/35" />

            <div className="absolute -bottom-32 left-[10%] h-64 w-[120%] rounded-[50%] bg-[#6d2c12]/35 blur-2xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-24 shrink-0">
                <CoffeeCupArtwork className="absolute inset-0 h-full w-full overflow-visible drop-shadow-2xl" />
              </div>

              <div>
                <p className="text-lg font-extrabold text-white">
                  Cafe Ordering Platform
                </p>

                <p className="mt-1 text-sm text-orange-100/60">
                  Multi-tenant administration
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-xl xl:mt-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/15 bg-white/[0.07] px-4 py-2 text-sm font-bold text-orange-100 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-orange-300" />
                Built for modern cafe operations
              </div>

              <h2 className="mt-7 text-5xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-6xl">
                Run your cafe from one{" "}
                <span className="bg-gradient-to-r from-orange-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                  intelligent workspace.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-lg leading-8 text-orange-50/65">
                Manage customer orders, menu availability,
                payments and cafe settings without mixing
                data between different cafes.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 grid gap-3 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.055] p-4 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-orange-200/20 hover:bg-white/[0.09]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-200/10 text-orange-200">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-orange-100/55">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[linear-gradient(145deg,rgba(248,237,228,0.96),rgba(229,198,174,0.88))] px-5 py-10 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="relative h-16 w-20 shrink-0">
                <CoffeeCupArtwork className="absolute inset-0 h-full w-full overflow-visible drop-shadow-lg" />
              </div>

              <div>
                <p className="font-extrabold text-[#2b160d]">
                  Cafe Ordering Platform
                </p>

                <p className="text-xs text-[#857166]">
                  Secure admin portal
                </p>
              </div>
            </div>

            <AdminLoginForm />

            <p className="mt-6 text-center text-xs text-[#927f73]">
              Protected by encrypted credentials and signed
              sessions.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
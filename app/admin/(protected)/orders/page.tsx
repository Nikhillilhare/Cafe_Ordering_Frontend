import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";

export const metadata: Metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/65 p-8 shadow-xl shadow-black/10 backdrop-blur-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
        <ReceiptText className="h-7 w-7" />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-white">
        Order management
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
        Customer orders, status updates and order details will be managed
        from this page.
      </p>
    </section>
  );
}
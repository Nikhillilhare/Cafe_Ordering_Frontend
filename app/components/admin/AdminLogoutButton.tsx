"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, LogOut } from "lucide-react";

type AdminLogoutButtonProps = {
  compact?: boolean;
};

export default function AdminLogoutButton({
  compact = false,
}: AdminLogoutButtonProps) {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to sign out.",
        );
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to sign out.",
      );

      setIsLoggingOut(false);
    }
  }

  return (
    <div>
      <motion.button
        type="button"
        disabled={isLoggingOut}
        onClick={handleLogout}
        whileHover={{
          x: compact ? 0 : 3,
          backgroundColor: "rgba(244, 63, 94, 0.10)",
        }}
        whileTap={{
          scale: 0.97,
        }}
        title={compact ? "Sign out" : undefined}
        className={[
          "flex w-full items-center rounded-xl border border-transparent text-sm font-semibold text-slate-400 transition-colors hover:border-rose-400/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60",
          compact
            ? "justify-center p-3"
            : "justify-start gap-3 px-4 py-3",
        ].join(" ")}
      >
        {isLoggingOut ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5" />
        )}

        {!compact && (
          <span>
            {isLoggingOut ? "Signing out…" : "Sign out"}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {error && !compact && (
          <motion.p
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="mt-2 overflow-hidden px-4 text-xs text-rose-300"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}